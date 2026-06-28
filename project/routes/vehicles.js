const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
    res.json(req.app.locals.seedData.vehicles);
});


router.get("/:vehicleId", (req, res) => {

    const vehicleId = Number(req.params.vehicleId);

    const vehicle = req.app.locals.seedData.vehicles.find(
        v => v.id === vehicleId
    );

    if (!vehicle) {
        return res.status(404).json({
            message: "Vehicle not found"
        });
    }

    res.json(vehicle);

});


router.get("/:vehicleId/pings", (req, res) => {

    const vehicleId = Number(req.params.vehicleId);

    const vehicle = req.app.locals.seedData.vehicles.find(
        v => v.id === vehicleId
    );

    if (!vehicle) {
        return res.status(404).json({
            message: "Vehicle not found"
        });
    }

    const pings = req.app.locals.seedData.pings.filter(
        p => p.vehicle_id === vehicleId
    );

    res.json(pings);

});

module.exports = router;