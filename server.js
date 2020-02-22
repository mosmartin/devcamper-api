require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const debug = require('debug')('worker:server');
require('colors');
require('supports-color');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./src/middleware/errors');
const dbConnect = require('./config/db');

// require the route handlers
const auth = require('./src/routes/auth');
const bootcamps = require('./src/routes/bootcamps');
const courses = require('./src/routes/courses');

const app = express();
const PORT = process.env.PORT;

// connect to the database
dbConnect();

// secure app
app.use(helmet());

// use the body parser middleware
app.use(express.json());

// use the cookie parser middleware
app.use(cookieParser());

// dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// file upload
app.use(fileUpload());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

// error handling middleware
app.use(errorHandler);

const server = app.listen(
  PORT,
  debug(`\t🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  // console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}...`.green.inverse)
);
