'use strict';

// We don't need to use our mongoose.js (/server/db/mongoose.js)
// Instead use the npm library
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  text: {
    type:String,
    required: true,
    minlength: 1, // To avoid ''
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

// The first argument is the singular name of the collection your model is for.
// Mongoose automatically looks for the plural version of your model name.
// Thus, for the example below, the model Todo is for the todos collection in the database
const Todo = mongoose.model('Todo', todoSchema);

module.exports = { Todo };
