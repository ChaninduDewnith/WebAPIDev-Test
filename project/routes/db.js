const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
    const uri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?ssl=true&replicaSet=${process.env.MONGO_REPLICA_SET}&authSource=admin&retryWrites=true&w=majority`;
    await mongoose.connect(uri);
    return mongoose.connection.db;
}

module.exports = { connectDB };
