const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
    const uri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@ac-pzcq7vh-shard-00-00.i8joo4s.mongodb.net:27017,ac-pzcq7vh-shard-00-01.i8joo4s.mongodb.net:27017,ac-pzcq7vh-shard-00-02.i8joo4s.mongodb.net:27017/?ssl=true&authSource=admin&retryWrites=true&w=majority`;
    await mongoose.connect(uri);
    return mongoose.connection.db;
}

module.exports = { connectDB };
