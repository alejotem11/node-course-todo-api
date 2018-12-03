'use strict';
require('./config'); // Set up the environment variables needed

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');
const {mongoose} = require('./../db/mongoose'); // Destructuring an object in ES6. Equal to const mongoose = require('./db/mongoose').mongoose
const {User} = require('./user'); // Destructuring an object in ES6
const {authenticate} = require('./../middleware/authentication');

const app = express(); // Create the express app

// Middleware is a tool that allows you to add on to the existing funcionality
// that express has. So if express doesn't do something that you would like to
// do you can add some middelware and teach it how to do that thing
// The way to register a midleware is to use app.use([the function you want])
app.use(bodyParser.json()); // To parse incoming request json bodies under the req.body property

// Sign up route
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);
  user
    .save()
    .then(() => user.generateAuthToken())
    // Prefix the header with "x-" to create custom header
    .then(token => res.status(201).header('x-auth', token).send({user}))
    .catch(error => res.status(400).send({ error }));
});

// Private route (Use the authenticate middelware)
app.get('/users/me', authenticate, (req, res) => {
  res.send({user: req.user, token: req.token});
});

app.listen(process.env.PORT, () => console.log('Users API running...'));

// Export the app to be able to test it in the tests/server.test.js file
module.exports = {app}; // ES6 Object syntax. It is the same as {app: app}
