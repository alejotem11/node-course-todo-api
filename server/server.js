'use strict';

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');
const {mongoose} = require('./db/mongoose'); // Destructuring an object in ES6. Equal to const mongoose = require('./db/mongoose').mongoose
const {Todo} = require('./models/todo'); // Destructuring an object in ES6
const {User} = require('./models/user'); // Destructuring an object in ES6

const port = process.env.PORT || 3000; // In order to deploy to heroku
const app = express(); // Create the express app

// Middleware is a tool that allows you to add on to the existing funcionality
// that express has. So if express doesn't do something that you would like to
// do you can add some middelware and teach it how to do that thing
// The way to register a midleware is to use app.use([the function you want])
app.use(bodyParser.json()); // To parse incoming request json bodies under the req.body property

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });
  todo
    .save()
    .then(todo => res.status(201).send({ todo }))
    .catch(error => res.status(400).send({ error }));
});

app.get('/todos', (req, res) => {
  Todo
    .find()
    // In the below line you could send the todos array: res.send(todos), but it
    // is better to use objects for flexibility, ej: to add new properties to the response
    .then(todos => res.send({ todos })) // Default http status = 200
    .catch(error => res.status(400).send({ error }));
});

app.get('/todos/:id', (req, res) => {
  const {id} = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send(); // Send empty body
  }
  Todo
    .findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send(); // Send empty body
      }
      res.send({ todo }); // Default http status = 200
    })
    .catch(error => res.status(400).send({ error })); // Send empty body
});

app.delete('/todos/:id', (req, res) => {
  const {id} = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send(); // Send empty body
  }
  Todo
    .findByIdAndDelete(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send(); // Send empty body
      }
      res.send({ todo });
    })
    .catch(error => res.status(400).send({ error }));
});

app.put('/todos/:id', (req, res) => {
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
    .findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({ todo });
    })
    .catch(error => res.status(400).send({ error }));
});

app.listen(port, () => console.log('Started on port', port));

// Export the app to be able to test it in the tests/server.test.js file
module.exports = {app}; // ES6 Object syntax. It is the same as {app: app}
