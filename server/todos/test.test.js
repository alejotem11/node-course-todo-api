const expect = require('expect');
const request = require('supertest');

const {ObjectId} = require('mongodb');
const {app} = require('./controller'); // Destructuring an object in ES6
const {Todo} = require('./todo'); // Destructuring an object in ES6

const todos = [{
  _id: new ObjectId(),
  text: 'Something new to do'
}, {
  _id: new ObjectId(),
  text: 'Another thing to do',
  completed: true,
  completedAt: 123456
}];

// Testing lifecycle method [beforeEach], which let us to run some code before
// any single test case, and is going to move on to the test cases once done() is called.
// In this case we are going to use it to set up the database to ensure it is empty
// in order to pass the expect statemt: expect(todos.length).toBe(1); at the end of
// the [should create a new todo] test case
// beforeEach((done) => {
//   Todo.deleteMany().then(() => done()); // Remove all the todos from the database
// });

// Alternately, instead of using the done() callback, you may return a Promise
// beforeEach(() => Todo.deleteMany());

beforeEach(() => {
  Todo.deleteMany().then(() => {
    return Todo.insertMany(todos);
  });
});

// Use describe to group the test cases in the output of the the terminal
describe('POST /todos', () => {
  // To test async calls you should use the done parameter to tell mocha to wait
  // until done() is called to decide whether or not the test passed
  it('should create a new todo', done => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
      .send({ text }) // ES6 object syntax. Supertest lib is going to convert the object to json
      .expect(201)
      .expect(res => { // To make assertions about the response
        expect(res.body.todo.text).toBe(text);
      })
      // To wrap up the request use end().
      // To make other assertions once the above have been done use end(callback)
      // For example to query the database to check consistency after a change
      .end((err, res) => { // Checking what was stored in the mongoDB collection instead of passing end(done);
        if (err) { // if any of the expect calls above fail
          return done(err); // return statment to stop the execution of the code
        }

        Todo
          .findById(res.body.todo._id)
          .then(todo => {
            expect(todo).toBeTruthy();
            expect(todo.text).toBe(res.body.todo.text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not create todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400) // Since in this case we do not need to make assertions about the response we can move on to the end() call right here
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then(todos => {
          expect(todos.length).toBe(2);
          done();
        }).catch(e => done(e));
      });
  });

});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => expect(res.body.todos.length).toBe(2))
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    const id = todos[0]._id;
    request(app)
      .get(`/todos/${id}`)
      .expect(200)
      .expect(res => expect(res.body.todo.text).toBe(todos[0].text))
      .end(done);
  });

  it('should return 404 for not found todo', done => {
    const id = new ObjectId();
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for invalid id', done => {
    const id = '123abc';
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    const id = todos[0]._id;
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect(res => expect(res.body.todo._id).toBe(todos[0]._id.toHexString()))
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo
          .findById(id)
          .then(todo => {
            expect(todo).toBeNull();
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should return 404 for not found todo', done => {
    const id = new ObjectId();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for invalid id', done => {
    const id = '123abc';
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });
});

describe('PUT /todos/:id', () => {
  it('should update the todo', done => {
    const id = todos[0]._id;
    const todoUpdated = {
      text: "Text updated successfully",
      completed: true
    };
    request(app)
      .put(`/todos/${id}`)
      .send(todoUpdated)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todoUpdated.text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeLessThanOrEqual(new Date().getTime());
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo
          .findById(id)
          .then(todo => {
            expect(todo).toBeTruthy();
            expect(todo.text).toBe(res.body.todo.text);
            expect(todo.completed).toBe(res.body.todo.completed);
            expect(todo.completedAt).toBe(res.body.todo.completedAt);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should clear the completedAt property when todo is not completed', done => {
    const id = todos[1]._id;
    request(app)
      .put(`/todos/${id}`)
      .send({ completed: false })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.completedAt).toBeNull();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo
          .findById(id)
          .then(todo => {
            expect(todo).toBeTruthy();
            expect(todo.text).toBe(res.body.todo.text);
            expect(todo.completed).toBe(false);
            expect(todo.completed).toBe(res.body.todo.completed);
            expect(todo.completedAt).toBeNull();
            expect(todo.completedAt).toBe(res.body.todo.completedAt);
            done();
          })
          .catch(e => done(e));
      });
  });
});
