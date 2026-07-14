const express = require("express");
const { data, errors, normalizeVehicleKeyId, deviceKeys, lastPing, resolveVehicleId } = require("./utils");

const router = express.Router();

router.get("/", (req, res) => {
    res.json(data.vehicles);
});

router.get("/:id", (req, res) => {
    const vehicle = data.vehicles.find(
        v => v.vehicle_id === req.params.id
    );

    if (!vehicle) return res.status(404).json(errors.vehicleNotFound);

    res.json({
        ...vehicle,
        last_ping: lastPing(req.params.id)
    });
});

router.get("/:id/pings", (req, res) => {
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

router.post("/:vehicleId/pings", (req, res) => {
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

router.get("/:id/last-position", (req, res) => {
    const vehicle = data.vehicles.find(
        v => v.vehicle_id === req.params.id
    );
    if (!vehicle) return res.status(404).json(errors.vehicleNotFound);

    res.json(lastPing(req.params.id));
});

module.exports = router;
