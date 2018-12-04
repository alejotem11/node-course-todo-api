'use strict';

const _ = require('lodash');
const express = require('express');
const {ObjectId} = require('mongodb');
const {User} = require('./model'); // Destructuring an object in ES6
const {authenticate} = require('./../middleware/authentication');
const router = express.Router();

// Sign up route
router.post('/', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);
  user
    .save()
    .then(() => user.generateAuthToken()
      .then(token =>
        // Prefix the header with "x-" to create custom header
        res.status(201).header('x-auth', token).send({user})
      )
    )
    .catch(error => res.status(400).send({ error }));
});

// Private route (Use the authenticate middelware)
router.get('/me', authenticate, (req, res) => {
  res.send({user: req.user, token: req.token});
});

// Log in
router.post('/login', (req, res) => {
  User
    .findByCredentials(req.body.email, req.body.password)
    .then(user => {
      return user
        .generateAuthToken()
        .then(token => res.header('x-auth', token).send({ user }))
    })
    .catch(error => res.status(400).send({ error }));
});

// Log out
router.delete('/me/token', authenticate, (req, res) => {
  req.user // Because of the middelware athenticate
    .removeToken(req.token)
    .then(() => res.send())
    .catch(error => res.status(400).send({ error }));
});

module.exports = router;
