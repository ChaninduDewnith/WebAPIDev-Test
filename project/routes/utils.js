const { connectDB } = require("./db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

let db;

async function getDB() {
    if (!db) db = await connectDB();
    return db;
}

function normalizeVehicleKeyId(vehicleId) {
    const suffixMatch = vehicleId.match(/^v-?0*(\d+)$/i);
    if (suffixMatch) {
        return `v-${String(Number(suffixMatch[1])).padStart(2, "0")}`;
    }

    const directSuffix = vehicleId.replace(/^[A-Za-z]+/, "");
    if (directSuffix) {
        return `v-${String(Number(directSuffix)).padStart(2, "0")}`;
    }

    return vehicleId;
}

async function lastPing(vehicleId) {
    const _db = await getDB();
    const pings = await _db.collection("pings")
        .find({ vehicle_id: vehicleId })
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();
    return pings[0] || null;
}

async function resolveVehicleId(vehicleId) {
    const _db = await getDB();
    const vehicle = await _db.collection("vehicles").findOne({ vehicle_id: vehicleId });
    if (vehicle) return vehicle.vehicle_id;

    const normalizedKeyId = normalizeVehicleKeyId(vehicleId);
    const allVehicles = await _db.collection("vehicles").find().toArray();
    const fallbackMatch = allVehicles.find(v => normalizeVehicleKeyId(v.vehicle_id) === normalizedKeyId);
    return fallbackMatch ? fallbackMatch.vehicle_id : null;
}

const errors = {
    provinceNotFound: { error: "Province not found" },
    districtNotFound: { error: "District not found" },
    stationNotFound: { error: "Station not found" },
    vehicleNotFound: { error: "Vehicle not found" },
    missingApiKey: { error: "X-API-Key header is required" },
    invalidApiKey: { error: "Invalid API key" }
};

function authenticateToken(req, res, next) {
    const authHeader = req.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization header with Bearer token is required" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}

module.exports = {
    getDB,
    normalizeVehicleKeyId,
    lastPing,
    resolveVehicleId,
    errors,
    authenticateToken
};
