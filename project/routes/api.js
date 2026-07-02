const express = require("express");
const fs = require("fs");

const router = express.Router();

const data = JSON.parse(fs.readFileSync("./seed.json", "utf8"));

function lastPing(vehicleId) {
    const pings = data.pings
        .filter(p => p.vehicle_id === vehicleId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return pings[0] || null;
}


router.get("/provinces", (req, res) => {
    res.json(data.provinces);
});

router.get("/provinces/:id", (req, res) => {
    res.json(
        data.provinces.find(
            p => p.province_id === req.params.id
        )
    );
});


router.get("/districts", (req, res) => {
    res.json(data.districts);
});

router.get("/districts/:id", (req, res) => {
    res.json(
        data.districts.find(
            d => d.district_id === req.params.id
        )
    );
});


router.get("/stations", (req, res) => {
    res.json(data.stations);
});

router.get("/stations/:id", (req, res) => {
    res.json(
        data.stations.find(
            s => s.station_id === req.params.id
        )
    );
});


router.get("/vehicles", (req, res) => {
    res.json(data.vehicles);
});

router.get("/vehicles/:id", (req, res) => {
    const v = data.vehicles.find(
        v => v.vehicle_id === req.params.id
    );

    res.json({
        ...v,
        last_ping: lastPing(req.params.id)
    });
});

router.get("/vehicles/:id/pings", (req, res) => {
    res.json(
        data.pings.filter(
            p => p.vehicle_id === req.params.id
        )
    );
});

router.get("/vehicles/:id/last-position", (req, res) => {
    res.json(lastPing(req.params.id));
});

module.exports = router;