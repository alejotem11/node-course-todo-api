'use strict';

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nodejs-course';
mongoose.Promise = global.Promise; // Set up mongoose to use Promises built-in javascript lib
mongoose.connect(url, {useNewUrlParser: true });

module.exports = { mongoose };
