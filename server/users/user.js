'use strict';

// We don't need to use our mongoose.js (/server/db/mongoose.js)
// Instead use the npm library
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const secret = 'somesecret'; // This shouldn't be clear in the code, instead it should be in the config file
const _ = require('lodash');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail, // this is the same as value => validator.isEmail(value)
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 1
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// Instance method
userSchema.methods.generateAuthToken = function() {
  const user = this; // Instance
  const access = 'auth';
  const token = jwt.sign({ _id: user.id, access }, secret);
  user.tokens.push({ access, token });
  // user.tokens.concat([{ access, token }]);
  return user.save().then(() => token);
};

userSchema.methods.toJSON = function() {
  return _.pick(this, ['_id', 'email']);
};

// Model method
userSchema.statics.findByToken = function (token) {
  var User = this; // Object
  var decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

// The first argument is the singular name of the collection your model is for.
// Mongoose automatically looks for the plural version of your model name.
// Thus, for the example below, the model User is for the users collection in the database
const User = mongoose.model('User', userSchema);

module.exports = { User };