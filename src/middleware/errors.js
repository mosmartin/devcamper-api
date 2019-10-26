const debug = require("debug")("worker:errors-middleware");
require("supports-color");

const errorHandler = (err, req, res, next) => {
  // log to console
  debug(err.stack);

  res.status(500).json({
    success: false,
    error: err.message
  });
};

module.exports = errorHandler;
