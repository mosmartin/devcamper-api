const mongoose = require('mongoose');
const slugify = require('slugify');
require('supports-color');
const geocoder = require('../utils/geocoder');

const Schema = mongoose.Schema;

const bootcampSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      minlength: [5, 'Name cannot be less than 5 characters.'],
      maxlength: [50, 'Name cannot be more than 50 characters.']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      minlength: [5, 'A description cannot be less than 5 characters.'],
      maxlength: [500, 'A description cannot be more than 500 characters.']
    },
    website: {
      type: String,
      match: [
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
        'Please enter a valid web address.'
      ]
    },
    phone: {
      type: String,
      minlength: [8, 'A phone no. cannot be less than 8 characters.'],
      maxlength: [20, 'A phone no. cannot be longer than 20 characters.']
    },
    email: {
      type: String,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid email address'
      ]
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    location: {
      // GeoJSON
      type: {
        type: String,
        enum: ['Point'] // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    careers: {
      // array of strings
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other'
      ]
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot be more than 10']
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'default-photo.jpg'
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    averageCost: Number
    // createdAt: {
    //   type: Date,
    //   default: Date.now
    // }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
  { timestamps: true }
);

// create the bootcamp's slug from the name
bootcampSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// geocode & location deta
bootcampSchema.pre('save', async function(next) {
  const locationData = await geocoder.geocode(this.address);

  this.location = {
    type: 'Point',
    coordinates: [locationData[0].longitude, locationData[0].latitude],
    formattedAddress: locationData[0].formattedAddress,
    street: locationData[0].streetName,
    city: locationData[0].city,
    state: locationData[0].stateCode,
    zipCode: locationData[0].zipCode,
    country: locationData[0].countryCode
  };

  // do not save the address in the database
  this.address = undefined;

  next();
});

// cascade delete courses when a bootcamp is deleted
bootcampSchema.pre('remove', async function(next) {
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

// reverse populate with virtuals
bootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
});

// create the model
const Bootcamp = mongoose.model('Bootcamp', bootcampSchema);

module.exports = Bootcamp;
