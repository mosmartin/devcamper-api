const jwt = require('jsonwebtoken');
const debug = require('debug')('worker:auth-middleware');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

// route protector
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // check for the auth header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; // split the auth array and get the second value
  }

  // make sure the token exists
  if (!token) {
    return next(new ErrorResponse(`Unauthorized!`, 401));
  }

  // verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // debug(decoded);

    // get the logged in user details based on the user id passed in the token
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse(`Unauthorized!`, 401));
  }
});

// role based auth
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // check if logged in user has an assgined role
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${req.user.role} is unauthorized !`, 403)
      );
    }

    next();
  };
};
