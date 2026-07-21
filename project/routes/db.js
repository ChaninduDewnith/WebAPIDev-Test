const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
    const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.i8joo4s.mongodb.net/`;
    await mongoose.connect(uri);
    return mongoose.connection.db;
}

module.exports = { connectDB };
