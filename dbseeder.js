require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const debug = require("debug")("worker:db-seeder-util");
require("supports-color");

// load models
const Bootcamp = require("./src/models/Bootcamp");

// connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// read the JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

// import into db
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    debug("Data successfully imported...");
    process.exit();
  } catch (err) {
    debug(err);
  }
};

// delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    debug("Data successfully deleted...");
    process.exit();
  } catch (err) {
    debug(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
