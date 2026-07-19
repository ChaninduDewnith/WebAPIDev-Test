const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config();

async function seedDatabase() {
    try {
        await mongoose.connect(`mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?ssl=true&replicaSet=${process.env.MONGO_REPLICA_SET}&authSource=admin&retryWrites=true&w=majority`);
        
        const data = JSON.parse(
            fs.readFileSync("seed.json", "utf8")
        );

        const db = mongoose.connection.db;

        await db.collection("provinces").insertMany(data.provinces);
        await db.collection("districts").insertMany(data.districts);
        await db.collection("stations").insertMany(data.stations);
        await db.collection("vehicles").insertMany(data.vehicles);
        await db.collection("pings").insertMany(data.pings);

        console.log("Data imported successfully");

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seedDatabase();