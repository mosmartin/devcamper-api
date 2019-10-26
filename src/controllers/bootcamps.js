const debug = require("debug")("worker:bootcamp-controller");
require("supports-color");
const ErrorResponse = require("../helpers/ErrorResponse");
const Bootcamp = require("../models/Bootcamp");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();

    // successful response
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    // check if bootcamp exists
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp with id: ${req.params.id} not found`, 404)
      );
    }

    // successful response
    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
  try {
    // create the record in the database
    const bootcamp = await Bootcamp.create(req.body);

    // successful response
    res.status(201).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // check if bootcamp exists
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp with id: ${req.params.id} not found`, 404)
      );
    }
    // successful response
    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    // check if bootcamp exists
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp with id: ${req.params.id} not found`, 404)
      );
    }
    // successful response
    res.status(200).json({
      success: true
    });
  } catch (err) {
    next(err);
  }
};
