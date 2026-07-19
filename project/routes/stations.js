const express = require("express");
const { getDB, errors } = require("./utils");

const router = express.Router();

router.get("/", async (req, res) => {
    const db = await getDB();
    const stations = await db.collection("stations").find().toArray();
    res.json(stations);
});

router.get("/:id", async (req, res) => {
    const db = await getDB();
    const station = await db.collection("stations").findOne({ station_id: req.params.id });
    if (!station) return res.status(404).json(errors.stationNotFound);
    res.json(station);
});

module.exports = router;
