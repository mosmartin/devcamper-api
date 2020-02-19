const mongoose = require('mongoose');

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
    }
  },
  {
    timestamps: true
  }
);

// create the model
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
