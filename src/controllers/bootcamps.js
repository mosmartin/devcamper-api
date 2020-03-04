const path = require('path');
const debug = require('debug')('worker:bootcamp-controller');
require('supports-color');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // successful response
  res.status(200).json(res.advancedResults);
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
  // add user to req.body
  req.body.user = req.user.id;

  // check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // if the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with id ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

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
  let bootcamp = await Bootcamp.findById(req.params.id);

  // check if bootcamp exists
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id: ${req.params.id} not found`, 404)
    );
  }

  // ensure logged in user can update to bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `You (id: ${req.params.id}) are not authorized to update this bootcamp`,
        401
      )
    );
  }

  // update bootcamp
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

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
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  // to effect the cascade deletion of courses in the deleted bootcamp
  const bootcamp = await Bootcamp.findById(req.params.id);

  // check if bootcamp exists
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id: ${req.params.id} not found`, 404)
    );
  }

  // ensure logged in user can update to bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `You (id: ${req.params.id}) are not authorized to delete this bootcamp`,
        401
      )
    );
  }

  // this will trigger the cascade effect
  await bootcamp.remove();

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

// @desc    Upload a photo for a bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  // to effect the cascade deletion of courses in the deleted bootcamp
  const bootcamp = await Bootcamp.findById(req.params.id);

  // check if bootcamp exists
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id: ${req.params.id} not found`, 404)
    );
  }

  // check if a file was uploaded
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a bootcamp photo.`, 400));
  }

  const file = req.files.file;

  // make sure the file is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // check the file size
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(
      new ErrorResponse(
        `Please upload an image file less than ${process.env.MAX_FILE_SIZE}`,
        400
      )
    );
  }

  // create a custom file name
  file.name = `photo-${bootcamp._id}${path.parse(file.name).ext}`;

  // move the file to the local file system
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      debug(err);

      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // pass filename to database
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
