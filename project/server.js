const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;


const seedData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "seed.json"), "utf8")
);

app.use(express.json());


app.locals.seedData = seedData;


app.use("/provinces", require("./routes/provinces"));
app.use("/districts", require("./routes/districts"));
app.use("/stations", require("./routes/stations"));
app.use("/vehicles", require("./routes/vehicles"));

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});