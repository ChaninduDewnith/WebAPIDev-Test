const express = require("express");
const { basicAuth } = require("./routes/utils");
const provincesRouter = require("./routes/provinces");
const districtsRouter = require("./routes/districts");
const stationsRouter = require("./routes/stations");
const vehiclesRouter = require("./routes/vehicles");

const app = express();

app.use(express.json());
app.use(basicAuth);
app.use("/provinces", provincesRouter);
app.use("/districts", districtsRouter);
app.use("/stations", stationsRouter);
app.use("/vehicles", vehiclesRouter);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});