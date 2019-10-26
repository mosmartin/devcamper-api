require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const debug = require("debug")("worker:server");
require("colors");
require("supports-color");
const errorHandler = require("./src/middleware/errors");
const dbConnect = require("./config/db");

// require the route handlers
const bootcamps = require("./src/routes/bootcamps");

const app = express();
const PORT = process.env.PORT;

// connect to the database
dbConnect();

// use the body parser middleware
app.use(express.json());

// dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// mount routers
app.use("/api/v1/bootcamps", bootcamps);

// error handling middleware
app.use(errorHandler);

const server = app.listen(
  PORT,
  debug(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  //   console.log(
  //     `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  //   )
);

// handle unhandled promise rejections
// process.on("unhandledRejection", (err, promise) => {
//   debug(`ERROR: ${err.message}`);

//   // close server and exit the process
//   server.close(() => process.exit(1));
// });
