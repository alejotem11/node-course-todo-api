'use strict';

const mongoose = require('mongoose');
const opts = { useNewUrlParser: true, useFindAndModify: false };

mongoose.connect(process.env.MONGODB_URL, opts);

module.exports = { mongoose };
