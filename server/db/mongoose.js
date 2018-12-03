'use strict';

const mongoose = require('mongoose');
const opts = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
};

mongoose.connect(process.env.DB_URL, opts);

module.exports = { mongoose };
