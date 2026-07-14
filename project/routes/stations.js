const express = require("express");
const { data, errors } = require("./utils");

const router = express.Router();

router.get("/", (req, res) => {
    res.json(data.stations);
});

router.get("/:id", (req, res) => {
    const station = data.stations.find(
        s => s.station_id === req.params.id
    );
    if (!station) return res.status(404).json(errors.stationNotFound);
    res.json(station);
});

module.exports = router;
