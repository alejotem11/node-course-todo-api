'use strict';
// Set up the environment variables needed
const {loadConfig} = require('./../config/config');
loadConfig('todos');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');
const {mongoose} = require('./../db/mongoose'); // Destructuring an object in ES6. Equal to const mongoose = require('./db/mongoose').mongoose
const {Todo} = require('./todo'); // Destructuring an object in ES6
const {authenticate} = require('./../middleware/authentication');

const app = express(); // Create the express app

// Middleware is a tool that allows you to add on to the existing funcionality
// that express has. So if express doesn't do something that you would like to
// do you can add some middelware and teach it how to do that thing
// The way to register a midleware is to use app.use([the function you want])
app.use(bodyParser.json()); // To parse incoming request json bodies under the req.body property

app.post('/todos', authenticate, (req, res) => {
  let todo = new Todo({
    text: req.body.text,
    _creator: req.user._id // Because of the middleware authenticate
  });
  todo
    .save()
    .then(todo => res.status(201).send({ todo }))
    .catch(error => res.status(400).send({ error }));
});

app.get('/todos', authenticate, (req, res) => {
  Todo
    .find({ _creator: req.user._id })
    // In the below line you could send the todos array: res.send(todos), but it
    // is better to use objects for flexibility, ej: to add new properties to the response
    .then(todos => res.send({ todos })) // Default http status = 200
    .catch(error => res.status(400).send({ error }));
});

app.get('/todos/:id', authenticate, (req, res) => {
  const {id} = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send(); // Send empty body
  }
  Todo
    // .findById(id)
    .findOne({
      _id: id,
      _creator: req.user._id
    })
    .then(todo => {
      if (!todo) {
        return res.status(404).send(); // Send empty body
      }
      res.send({ todo }); // Default http status = 200
    })
    .catch(error => res.status(400).send({ error }));
});

app.delete('/todos/:id', authenticate, (req, res) => {
  const {id} = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send(); // Send empty body
  }
  Todo
    // .findByIdAndDelete(id)
    .findOneAndDelete({
      _id: id,
      _creator: req.user._id
    })
    .then(todo => {
      if (!todo) {
        return res.status(404).send(); // Send empty body
      }
      res.send({ todo });
    })
    .catch(error => res.status(400).send({ error }));
});

app.put('/todos/:id', authenticate, (req, res) => {
  const {id} = req.params;
  // To update just what we want to update, or else anyone could update properties
  // that we don't want to be updated such as the completedAt or the _id
  const body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectId.isValid(id)) {
    return res.status(404).send(); // Send empty body
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime(); // In milliseconds
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo
    // .findByIdAndUpdate(id, { $set: body }, { new: true })
    .findOneAndUpdate({
      _id: id,
      _creator: req.user._id
    }, { $set: body },
    { new: true})
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({ todo });
    })
    .catch(error => res.status(400).send({ error }));
});

app.listen(process.env.PORT, () => console.log('Todos API running...'));

// Export the app to be able to test it in the tests/server.test.js file
module.exports = {app}; // ES6 Object syntax. It is the same as {app: app}
