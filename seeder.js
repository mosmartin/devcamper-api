require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const color = require('colors');

// load models
const Bootcamp = require('./src/models/Bootcamp');
const Course = require('./src/models/Course');

// connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// read the JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/data/bootcamps.json`, 'utf-8')
);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/data/courses.json`, 'utf-8')
);

// import into db
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    console.log('👍 Data Successfully Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    debug(err);
  }
};

// delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany(); // no params passed so will delete all
    await Course.deleteMany();
    console.log('👍 Data Successfully Deleted...'.red.inverse);
    process.exit();
  } catch (err) {
    debug(err);
  }
};

if (process.argv[2] === '-i') {
  // node seeder -i
  importData();
} else if (process.argv[2] === '-d') {
  // node seeder -d
  deleteData();
}
