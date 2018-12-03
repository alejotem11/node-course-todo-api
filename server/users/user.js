'use strict';

// We don't need to use our mongoose.js (/server/db/mongoose.js)
// Instead use the npm library
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// Used to salt the data when it is going to be encrypted
// This shouldn't be clear in the code, instead it should be in the config file
const secret = 'somesecret';

const UserSchema = new mongoose.Schema({
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
UserSchema.methods.generateAuthToken = function() {
  const user = this; // Instance
  const access = 'auth';
  const token = jwt.sign({ _id: user.id, access }, secret);
  user.tokens.push({ access, token });
  // user.tokens.concat([{ access, token }]);
  return user.save().then(() => token); // return promise
};

UserSchema.methods.toJSON = function () {
  return _.pick(this, ['_id', 'email']);
};

UserSchema.methods.removeToken = function (token) {
  const user = this;
  return user.updateOne({
    $pull: { // $pull Mongo update operator to remove items from an array
      tokens: { token }
    }
  });
};

// Model method
UserSchema.statics.findByToken = function (token) {
  const User = this; // Object
  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (e) {
    return Promise.reject(e);
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  }); // return promise
};

UserSchema.statics.findByCredentials = function (email, password) {
  return new Promise((resolve, reject) => {
    if (!email || !password) {
      reject('Email and password are required');
    }
    const User = this;
    User
      .findOne({ email })
      .then(user => {
        if (!user) {
          reject('Email not found');
        }
        bcrypt.compareSync(password, user.password)
          ? resolve(user) : reject('Invalid password');
      })
      .catch(e => reject(e));
  });
};

// Mongoose middleware to run before the save() method (instance method) is exectuted
UserSchema.pre('save', function(next) {
  const user = this;
  // the method isModified is an instance method of the Schema object, and it
  // takes only one property of the instance to check
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            next();
        });
    });
  } else {
    next();
  }
});

// The first argument is the singular name of the collection your model is for.
// Mongoose automatically looks for the plural version of your model name.
// Thus, for the example below, the model User is for the users collection in the database
const User = mongoose.model('User', UserSchema);

module.exports = { User , secret }; // The secret object is exported in order to use it in the mocha test
