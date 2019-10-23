const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bootcampSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    minlength: [5, "Name cannot be less than 5 characters."],
    maxlength: [50, "Name cannot be more than 50 characters."]
  },
  slug: String,
  description: {
    type: String,
    required: [true, "Please add a description"],
    minlength: [5, "A description cannot be less than 5 characters."],
    maxlength: [500, "A description cannot be more than 500 characters."]
  },
  website: {
    type: String,
    match: [
      /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm,
      "Please enter a valid web address."
    ]
  },
  phone: {
    type: String,
    minlength: [8, "A phone no. cannot be less than 8 characters."],
    maxlength: [20, "A phone no. cannot be longer than 20 characters."]
  },
  email: {
    type: String,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email address"
    ]
  },
  address: {
    type: String,
    required: [true, "Please add an address"]
  }
});
