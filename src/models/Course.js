const mongoose = require('mongoose');
const debug = require('debug')('worker:course-model');

const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a course title']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    weeks: {
      type: String,
      required: [true, 'Please add the number of weeks']
    },
    tuition: {
      type: Number,
      required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
      type: String,
      required: [true, 'Please add a minimum skill'],
      enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarhipsAvailable: {
      type: Boolean,
      default: false
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // model
      required: true
    }
  },
  { timestamps: true }
);

// static method to get the average of the course tuitions
courseSchema.statics.getAverageCost = async function(bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' }
      }
    }
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
    });
  } catch (err) {
    debug(err);
    console.error(err);
  }
};

// call the getAverageCost after save
courseSchema.post('save', function() {
  this.constructor.getAverageCost(this.bootcamp);
});

// call the getAverageCost before remove
courseSchema.pre('remove', function() {
  this.constructor.getAverageCost(this.bootcamp);
});

// create the model
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
