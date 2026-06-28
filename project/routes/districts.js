const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
    res.json(req.app.locals.seedData.districts);
});


router.get("/:districtId", (req, res) => {

    const district = req.app.locals.seedData.districts.find(
        d => d.id === Number(req.params.districtId)
    );

    if (!district) {
        return res.status(404).json({
            message: "District not found"
        });
    }

    res.json(district);

});

module.exports = router;