const express = require("express");
const { getDB, normalizeVehicleKeyId, lastPing, resolveVehicleId, errors } = require("./utils");

const router = express.Router();

router.get("/", async (req, res) => {
    const db = await getDB();
    const vehicles = await db.collection("vehicles").find().toArray();
    res.json(vehicles);
});

router.get("/:id", async (req, res) => {
    const db = await getDB();
    const vehicle = await db.collection("vehicles").findOne({ vehicle_id: req.params.id });

    if (!vehicle) return res.status(404).json(errors.vehicleNotFound);

    res.json({
        ...vehicle,
        last_ping: await lastPing(req.params.id)
    });
});

router.get("/:id/pings", async (req, res) => {
    const db = await getDB();
    const vehicle = await db.collection("vehicles").findOne({ vehicle_id: req.params.id });
    if (!vehicle) return res.status(404).json(errors.vehicleNotFound);

    const pings = await db.collection("pings")
        .find({ vehicle_id: req.params.id })
        .toArray();
    res.json(pings);
});

router.post("/:vehicleId/pings", async (req, res) => {
    const vehicleId = await resolveVehicleId(req.params.vehicleId);

    if (!vehicleId) {
        return res.status(404).json(errors.vehicleNotFound);
    }

    const { latitude, longitude, speed } = req.body || {};

    if (latitude === undefined || longitude === undefined || speed === undefined) {
        return res.status(400).json({ error: "latitude, longitude, and speed are required" });
    }

    const db = await getDB();
    const count = await db.collection("pings").countDocuments();
    const ping = {
        ping_id: `PG${String(count + 1).padStart(4, "0")}`,
        vehicle_id: vehicleId,
        latitude,
        longitude,
        speed,
        timestamp: new Date().toISOString()
    };

    await db.collection("pings").insertOne(ping);

    res.set("Location", `/vehicles/${req.params.vehicleId}/pings/${ping.ping_id}`);
    res.set("ETag", `"${ping.ping_id}"`);
    res.set("Last-Modified", ping.timestamp);

    return res.status(201).json(ping);
});

router.get("/:id/last-position", async (req, res) => {
    const db = await getDB();
    const vehicle = await db.collection("vehicles").findOne({ vehicle_id: req.params.id });
    if (!vehicle) return res.status(404).json(errors.vehicleNotFound);

    res.json(await lastPing(req.params.id));
});

module.exports = router;
