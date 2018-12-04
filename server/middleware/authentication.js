const {User} = require('./../users/model');

// Middelware for private routes
const authenticate = (req, res, next) => {
  const token = req.header('x-auth');
  User
    .findByToken(token)
    .then(user => {
      if (!user) { // The token was valid but for some reason the query didn't get a result
        return Promise.reject(); // It is going to run the code of the catch section
      }
      req.user = user;
      req.token = token;
      next();
    })
    .catch(e => res.status(401).send()); // Unauthorized
};

module.exports = { authenticate };
