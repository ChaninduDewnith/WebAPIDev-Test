const fs = require("fs");

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

module.exports = {
    data,
    normalizeVehicleKeyId,
    deviceKeys,
    lastPing,
    resolveVehicleId,
    errors,
    basicAuth
};
