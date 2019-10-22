require("dotenv").config();
const express = require("express");

// require the route handlers
const bootcamps = require("./src/routes/bootcamps");

const app = express();

const PORT = process.env.PORT;

// mount routers
app.use("/api/v1/bootcamps", bootcamps);

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
