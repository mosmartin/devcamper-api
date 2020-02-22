const debug = require('debug')('worker:course-controller');
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
  // check if bootcamp id exists in the request
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    // get courses with bootcamp data
    res.status(200).json(res.advancedResults);
  }
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
      new ErrorResponse(`Bootcamp with id: ${req.params.id} not found`, 404)
    );
  }

  const course = await Course.create(req.body);

  // successful response
  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update a course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // check if bootcamp exists
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

// @desc    Delete a course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  // check if bootcamp exists
  if (!course) {
    return next(
      new ErrorResponse(`Course with id: ${req.params.id} not found`, 404)
    );
  }

  await course.remove();

  // successful response
  res.status(200).json({
    success: true
  });
});