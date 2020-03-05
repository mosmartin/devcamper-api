const debug = require('debug')('worker:user-controller');
require('supports-color');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const sendEMail = require('../utils/sendEmails');

// @desc    Register a User
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // create token
  // const token = user.getSignedJwtToken();

  // res.status(200).json({ success: true, token });

  getToken(user, 200, res);
});

// @desc    Login a User
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse(`Please provide an email and a password`, 400)
    );
  }

  // check if the user exists
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }

  // validate the password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }

  // create token
  // const token = user.getSignedJwtToken();

  // res.status(200).json({ success: true, token });

  getToken(user, 200, res);
});

// @desc    Get current logged in User
// @route   POST /api/v1/auth/me
// @access  Private
exports.me = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // check if user exists
  if (!user) {
    return next(
      new ErrorResponse(`User with ${req.body.email} email not found`, 404)
    );
  }

  // get the rest token
  const resetToken = user.getResetPasswordToken();

  // save the reset token and expiry time
  await user.save({ validateBeforeSave: false });

  /*prepare the email options */

  // create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetpassword/${resetToken}`;

  // create the reset message
  const message = `You are receiving this email because you (or someone else) has requested the rest of the password. Please make a PUT request to: \n\n ${resetUrl}`;

  // send mail
  try {
    await sendEMail({
      email: user.email,
      subject: 'Password Reset Token',
      message
    });

    res.status(200).json({
      success: true,
      data: 'Email Sent'
    });
  } catch (error) {
    debug(error);
    user.getResetPasswordToken = undefined;
    user.getResetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse(`Email could not be sent`, 500));
  }
});

// get token from the model, create a cookie and generate response
const getToken = (user, statusCode, res) => {
  // create token
  const token = user.getSignedJwtToken();

  // create cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // 30 days
    ),
    httpOnly: true
  };

  // secure cookie if https - production env
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
