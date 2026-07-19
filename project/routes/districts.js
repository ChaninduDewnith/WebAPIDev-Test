const express = require("express");
const { getDB, errors } = require("./utils");

const router = express.Router();

router.get("/", async (req, res) => {
    const db = await getDB();
    const districts = await db.collection("districts").find().toArray();
    res.json(districts);
});

router.get("/:id", async (req, res) => {
    const db = await getDB();
    const district = await db.collection("districts").findOne({ district_id: req.params.id });
    if (!district) return res.status(404).json(errors.districtNotFound);
    res.json(district);
});

module.exports = router;
