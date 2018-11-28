'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {mongoose} = require('./db/mongoose'); // Destructuring an object in ES6
const {Todo} = require('./models/todo'); // Destructuring an object in ES6
const {User} = require('./models/user'); // Destructuring an object in ES6

const port = process.env.PORT || 3000; // In order to deploy to heroku
const app = express();

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
