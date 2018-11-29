'use strict';

const mongoose = require('mongoose');

const url = 'mongodb://todoapp1:todoapp1@ds121624.mlab.com:21624/nodecourse-todoapi'
  || 'mongodb://localhost:27017/nodejs-course';
  
mongoose.Promise = global.Promise; // Set up mongoose to use Promises built-in javascript lib
mongoose.connect(url, {useNewUrlParser: true });

module.exports = { mongoose };
