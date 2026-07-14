const express = require("express");
const { data, errors } = require("./utils");

const router = express.Router();

router.get("/", (req, res) => {
    res.json(data.districts);
});

router.get("/:id", (req, res) => {
    const district = data.districts.find(
        d => d.district_id === req.params.id
    );
    if (!district) return res.status(404).json(errors.districtNotFound);
    res.json(district);
});

module.exports = router;
