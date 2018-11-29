'use strict';

const mongoose = require('mongoose');
const env = process.env.NODE_ENV || 'development';
const opts = { useNewUrlParser: true, useFindAndModify: false };
let mongodbUrl;

switch (env) {
  case 'development':
    mongodbUrl = 'mongodb://localhost:27017/nodejs-course';
    break;
  case 'test':
      mongodbUrl = 'mongodb://localhost:27017/nodejs-course-test'; // when running the test cases with mocha
      break;
  case 'production': // Heroku
      // Database created on https://mlab.com/home
      mongodbUrl = 'mongodb://todoapp1:todoapp1@ds121624.mlab.com:21624/nodecourse-todoapi';
      break;
  default:
    mongodbUrl = 'mongodb://localhost:27017/nodejs-course';
}

mongoose.connect(mongodbUrl, opts);

module.exports = { mongoose };
