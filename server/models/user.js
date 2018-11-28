'use strict';

// We don't need to use our mongoose.js (/server/db/mongoose.js)
// Instead use the npm library
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});

// The first argument is the singular name of the collection your model is for.
// Mongoose automatically looks for the plural version of your model name.
// Thus, for the example below, the model User is for the users collection in the database
const User = mongoose.model('User', userSchema);

module.exports = { User };
