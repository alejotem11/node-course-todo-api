'use strict';
require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const {mongoose} = require('./db/mongoose'); // Destructuring an object in ES6. Equal to const mongoose = require('./db/mongoose').mongoose
const todos = require('./todos/router');
const users = require('./users/router');
const app = express(); // Create the express app
const port = process.env.PORT;

// Middleware is a tool that allows you to add on to the existing funcionality
// that express has. So if express doesn't do something that you would like to
// do you can add some middelware and teach it how to do that thing
// The way to register a midleware is to use app.use([the function you want])
app.use(bodyParser.json()); // To parse incoming request json bodies under the req.body property

app.use('/todos', todos);
app.use('/users', users);

app.listen(port, () => console.log('API running on port', port));

// Export the app to be able to test it in the tests/server.test.js file
module.exports = {app}; // ES6 Object syntax. It is the same as {app: app}
