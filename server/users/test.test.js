const expect = require('expect');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const {ObjectId} = require('mongodb');
const {app} = require('./../server'); // Destructuring an object in ES6
const {User, secret} = require('./model'); // Destructuring an object in ES6

const idUserOne = new ObjectId();
const idUserTwo = new ObjectId();
const access = 'auth';

const users = [{
  _id: idUserOne,
  email: 'alejotem_11@ejemplo.com',
  password: 'userOnePass',
  tokens: [{
    access: access,
    token: jwt.sign({ _id: idUserOne, access}, secret)
  }]
}, {
  _id: idUserTwo,
  email: 'alejotem_2222@ejemplo.com',
  password: 'userTwoPass',
  tokens: [{
    access: access,
    token: jwt.sign({ _id: idUserTwo, access}, secret)
  }]
}];

beforeEach((done) => {
  User.deleteMany().then(() => {
    // The below statement is not going to execute the middleware for the save
    // method set up in the model user.js
    // return User.insertMany(users); //
    const promiseUserOne = new User(users[0]).save();
    const promiseUserTwo = new User(users[1]).save();

    return Promise.all([promiseUserOne, promiseUserTwo]);
  })
  .then(() => done());
});

describe('USERS', () => {
  describe('GET /users/me', () => {
    it('should return user if authenticated', done => {
      const user = users[0];
      const token = user.tokens[0].token;
      request(app)
        .get('/users/me')
        .set('x-auth', token)
        .expect(200)
        .expect(res => {
          expect(res.body.user.email).toBe(user.email);
          expect(res.body.user._id).toBe(user._id.toHexString());
          expect(res.body.token).toBe(token);
        })
        .end(done);
    });

    it('should return 401 if not authenticated', done => {
      const user = users[0];
      request(app)
        .get('/users/me')
        .expect(401)
        .end(done);
    });
  });

  describe('POST /users', () => {
    it('should create a user', done => {
      const user = {
        email: 'dummy@example.com',
        password: '123456'
      };
      request(app)
        .post('/users')
        .send(user)
        .expect(201)
        .expect(res => {
          expect(res.body.user.email).toBe(user.email);
        })
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          User
            .findByToken(res.header['x-auth'])
            .then(u => {
              expect(u._id.toHexString()).toBe(res.body.user._id);
              expect(u.password).not.toBe(user.password); // It must be encrypted
              done();
            })
            .catch(e => done(e));
        });
    });

    it('should return validation errors if request invalid', done => {
      const user = {
        email: 'wrongemail@fake',
        password: '1'
      };
      request(app)
        .post('/users')
        .send(user)
        .expect(400)
        .end(done);
    });

    it('should not create user if email in use', done => {
      request(app)
        .post('/users')
        .send(users[0])
        .expect(400)
        .end(done);
    });
  });

  describe('POST /users/login', () => {
    it('should login user and return a valid auth token in the x-auth header',
      done => {
      const credentials = {
        email: users[0].email,
        password: users[0].password
      }
      request(app)
        .post('/users/login')
        .send(credentials)
        .expect(200)
        .expect(res => {
          expect(res.header['x-auth']).toBeTruthy();
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          User
            .findByToken(res.header['x-auth'])
            .then(user => {
              expect(user.email).toBe(credentials.email);
              done();
            })
            .catch(e => done(e));
        })
    });

    it('should reject invalid login', done => {
      const badCredentials = {
        email: users[0].email,
        password: '123456'
      };
      request(app)
        .post('/users/login')
        .send(badCredentials)
        .expect(400)
        .end(done);
    });
  });

  describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', done => {
      let token = users[0].tokens[0].token;
      request(app)
        .delete('/users/me/token')
        .set('x-auth', token)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          User
            .findByToken(token)
            .then(user => {
              expect(user).toBeNull();
              done();
            })
            .catch(e => done(e));
        });
    });
  });
});

module.exports = { users }; // to be able to use the users created here in the todos test
