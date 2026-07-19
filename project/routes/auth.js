const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

const USERS = [
    { username: "police", password: "nibm2024", role: "admin" }
];

router.post("/login", (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: "username and password are required" });
    }

    const user = USERS.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
        { username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    res.json({ token });
});

module.exports = router;
