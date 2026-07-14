const express = require("express");
const { data, errors } = require("./utils");

const router = express.Router();

router.get("/", (req, res) => {
    res.json(data.provinces);
});

router.get("/:id", (req, res) => {
    const province = data.provinces.find(
        p => p.province_id === req.params.id
    );
    if (!province) return res.status(404).json(errors.provinceNotFound);
    res.json(province);
});

module.exports = router;
