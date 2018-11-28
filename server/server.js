'use strict';

const express = require('express');
const bodyParser = require('body-parser');
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
    .then(todo => res.status(201).send(todo))
    .catch(e => res.status(400).send(e));
});

app.listen(port, () => console.log('Started on port', port));

// Export the app to be able to test it in the tests/server.test.js file
module.exports = {app}; // ES6 Object syntax. It is the same as {app: app}
