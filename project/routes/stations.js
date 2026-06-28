const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
    res.json(req.app.locals.seedData.stations);
});


router.get("/:stationId", (req, res) => {

    const station = req.app.locals.seedData.stations.find(
        s => s.id === Number(req.params.stationId)
    );

    if (!station) {
        return res.status(404).json({
            message: "Station not found"
        });
    }

    res.json(station);

});

module.exports = router;