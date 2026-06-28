const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
    res.json(req.app.locals.seedData.provinces);
});


router.get("/:provinceId", (req, res) => {

    const province = req.app.locals.seedData.provinces.find(
        p => p.id === Number(req.params.provinceId)
    );

    if (!province) {
        return res.status(404).json({
            message: "Province not found"
        });
    }

    res.json(province);

});

module.exports = router;