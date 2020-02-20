const debug = require('debug')('app:bootcamp-controller');
require('supports-color');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // copy of request query
  const reqQuery = { ...req.query };

  // fields to exclude during filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // loop over removeFields and delete from the request query
  removeFields.forEach(param => delete reqQuery[param]);

  // create a query string
  let queryStr = JSON.stringify(reqQuery);

  // add operators to the query string
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // build the query
  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  // select fields to return
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // sort by createdAt date descending
    query = query.sort('-createdAt');
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // execute the query
  const bootcamps = await query;

  // pagination result
  const pagination = {};

  // next page
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  // previous page
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  // successful response
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  });
});

// @desc    Get a single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
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
});

// @desc    Create a bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // create the record in the database
  const bootcamp = await Bootcamp.create(req.body);

  // successful response
  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
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
});

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
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
});

// @desc    Get bootcamps within a sprecified radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  // get the params from the request
  const { zipcode, distance } = req.params;

  // get the lat & lng from the geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // calculate the radius using radians
  // get the radius of the earth
  // divide distance by radius of the earth
  // The radius of Earth at the equator is 3,963 miles | 6,378 kilometers
  const miles = 3963;
  const kilometers = 6378;

  const radius = distance / miles;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});
