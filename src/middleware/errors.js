const debug = require('debug')('worker:errors-middleware');
require('supports-color');
const ErrorResponse = require('../helpers/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // log to console
  debug(err);

  // mongoose bad object id
  if (err.name === 'CastError') {
    const message = `Resource with id: ${err.value} not found.`;
    error = new ErrorResponse(message, 404);
  }

  // mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered.`;
    error = new ErrorResponse(message, 400);
  }

  // mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
