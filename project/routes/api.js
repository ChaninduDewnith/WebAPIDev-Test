const express = require("express");
const fs = require("fs");

const router = express.Router();

const data = JSON.parse(fs.readFileSync("./seed.json", "utf8"));

function normalizeVehicleKeyId(vehicleId) {
    const suffixMatch = vehicleId.match(/^v-?0*(\d+)$/i);
    if (suffixMatch) {
        return `v-${String(Number(suffixMatch[1])).padStart(2, "0")}`;
    }

    const directSuffix = vehicleId.replace(/^[A-Za-z]+/, "");
    if (directSuffix) {
        return `v-${String(Number(directSuffix)).padStart(2, "0")}`;
    }

    return vehicleId;
}

const deviceKeys = Object.fromEntries(
    data.vehicles.map(vehicle => {
        const keyId = normalizeVehicleKeyId(vehicle.vehicle_id);
        return [keyId, `key_${keyId.replace("-", "")}`];
    })
);

function lastPing(vehicleId) {
    const pings = data.pings
        .filter(p => p.vehicle_id === vehicleId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return pings[0] || null;
}

function resolveVehicleId(vehicleId) {
    const directMatch = data.vehicles.find(v => v.vehicle_id === vehicleId);
    if (directMatch) return directMatch.vehicle_id;

    const normalizedKeyId = normalizeVehicleKeyId(vehicleId);
    const fallbackMatch = data.vehicles.find(v => normalizeVehicleKeyId(v.vehicle_id) === normalizedKeyId);

    return fallbackMatch ? fallbackMatch.vehicle_id : null;
}


const errors = {
    provinceNotFound: { error: "Province not found" },
    districtNotFound: { error: "District not found" },
    stationNotFound: { error: "Station not found" },
    vehicleNotFound: { error: "Vehicle not found" },
    missingApiKey: { error: "X-API-Key header is required" },
    invalidApiKey: { error: "Invalid API key" }
};

function basicAuth(req, res, next) {
    if (req.method !== "GET") return next();

    const authHeader = req.get("Authorization");

    if (!authHeader) {
        res.set("WWW-Authenticate", 'Basic realm="Police API"');
        return res.status(401).json({ error: "Authorization header is required" });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [username, password] = credentials.split(":");

    if (username !== "police" || password !== "nibm2024") {
        return res.status(403).json({ error: "Invalid credentials" });
    }

    next();
}

router.use(basicAuth);

router.get("/provinces", (req, res) => {
    res.json(data.provinces);
});

router.get("/provinces/:id", (req, res) => {
    const province = data.provinces.find(
        p => p.province_id === req.params.id
    );
    if (!province) return res.status(404).json(errors.provinceNotFound);
    res.json(province);
});


router.get("/districts", (req, res) => {
    res.json(data.districts);
});

router.get("/districts/:id", (req, res) => {
    const district = data.districts.find(
        d => d.district_id === req.params.id
    );
    if (!district) return res.status(404).json(errors.districtNotFound);
    res.json(district);
});


router.get("/stations", (req, res) => {
    res.json(data.stations);
});

router.get("/stations/:id", (req, res) => {
    const station = data.stations.find(
        s => s.station_id === req.params.id
    );
    if (!station) return res.status(404).json(errors.stationNotFound);
    res.json(station);
});


router.get("/vehicles", (req, res) => {
    res.json(data.vehicles);
});

router.get("/vehicles/:id", (req, res) => {
    const vehicle = data.vehicles.find(
        v => v.vehicle_id === req.params.id
    );

    if (!vehicle) return res.status(404).json(errors.vehicleNotFound);

    res.json({
        ...vehicle,
        last_ping: lastPing(req.params.id)
    });
});

router.get("/vehicles/:id/pings", (req, res) => {
    const vehicle = data.vehicles.find(
        v => v.vehicle_id === req.params.id
    );
    if (!vehicle) return res.status(404).json(errors.vehicleNotFound);

    res.json(
        data.pings.filter(
            p => p.vehicle_id === req.params.id
        )
    );
});

router.post("/vehicles/:vehicleId/pings", (req, res) => {
    const apiKey = req.get("X-API-Key");

    if (!apiKey) {
        return res.status(401).json(errors.missingApiKey);
    }

    const keyId = normalizeVehicleKeyId(req.params.vehicleId);

    if (deviceKeys[keyId] !== apiKey) {
        return res.status(403).json(errors.invalidApiKey);
    }

    const vehicleId = resolveVehicleId(req.params.vehicleId);

    if (!vehicleId) {
        return res.status(404).json(errors.vehicleNotFound);
    }

    const { latitude, longitude, speed } = req.body || {};

    if (latitude === undefined || longitude === undefined || speed === undefined) {
        return res.status(400).json({ error: "latitude, longitude, and speed are required" });
    }

    const ping = {
        ping_id: `PG${String(data.pings.length + 1).padStart(4, "0")}`,
        vehicle_id: vehicleId,
        latitude,
        longitude,
        speed,
        timestamp: new Date().toISOString()
    };

    data.pings.push(ping);

    res.set("Location", `/vehicles/${req.params.vehicleId}/pings/${ping.ping_id}`);
    res.set("ETag", `"${ping.ping_id}"`);
    res.set("Last-Modified", ping.timestamp);

    return res.status(201).json(ping);
});

router.get("/vehicles/:id/last-position", (req, res) => {
    const vehicle = data.vehicles.find(
        v => v.vehicle_id === req.params.id
    );
    if (!vehicle) return res.status(404).json(errors.vehicleNotFound);

    res.json(lastPing(req.params.id));
});

module.exports = router;