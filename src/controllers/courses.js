const debug = require('debug')('app:bootcamp-controller');
require('supports-color');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  // check if bootcamp id exists in the request
  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    // get courses with bootcamp data
    // query = Course.find().populate('bootcamp');

    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description'
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Get a single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  // check if course exists
  if (!course) {
    return next(
      new ErrorResponse(`Course with id: ${req.params.id} not found`, 404)
    );
  }

  // successful response
  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create a course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  // get bootcamp id
  req.body.bootcamp = req.params.bootcampId;

  // get bootcamp
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  // check if bootcamp exists
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with id: ${req.params.bootcampId} not found`,
        404
      )
    );
  }

  const course = await Course.create(req.body);

  // successful response
  res.status(201).json({
    success: true,
    data: course
  });
});
