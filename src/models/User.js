const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name.']
    },
    email: {
      type: String,
      required: [true, 'Please add an email address'],
      unique: true,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid email address'
      ]
    },
    role: {
      type: String,
      enum: ['user', 'publisher'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password should be at least 6 chars long'],
      select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

// encrypt the password
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// sign the JWT and return the signed token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// create the model
const User = mongoose.model('User', userSchema);

module.exports = User;
