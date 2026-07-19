const express = require("express");
const { getDB, errors } = require("./utils");

const router = express.Router();

router.get("/", async (req, res) => {
    const db = await getDB();
    const provinces = await db.collection("provinces").find().toArray();
    res.json(provinces);
});

router.get("/:id", async (req, res) => {
    const db = await getDB();
    const province = await db.collection("provinces").findOne({ province_id: req.params.id });
    if (!province) return res.status(404).json(errors.provinceNotFound);
    res.json(province);
});

module.exports = router;



