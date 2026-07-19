const { connectDB } = require("./db");

let db;

async function getDB() {
    if (!db) db = await connectDB();
    return db;
}

async function getDeviceKeys() {
    const _db = await getDB();
    const vehicles = await _db.collection("vehicles").find().toArray();
    return Object.fromEntries(
        vehicles.map(vehicle => {
            const keyId = normalizeVehicleKeyId(vehicle.vehicle_id);
            return [keyId, `key_${keyId.replace("-", "")}`];
        })
    );
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

function basicAuth(req, res, next) {
    if (req.method !== "GET") return next();

    const authHeader = req.get("Authorization");

    if (!authHeader) {
        res.set("WWW-Authenticate", 'Basic realm="Police API"');
        return res.status(401).json({ error: "Authorization header is required" });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [username, password] = credentials.split(":");

    if (username !== "police" || password !== "nibm2024") {
        return res.status(403).json({ error: "Invalid credentials" });
    }

    next();
}

module.exports = {
    getDB,
    getDeviceKeys,
    normalizeVehicleKeyId,
    lastPing,
    resolveVehicleId,
    errors,
    basicAuth
};
