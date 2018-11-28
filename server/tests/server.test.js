const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server'); // Destructuring an object in ES6
const {Todo} = require('./../models/todo'); // Destructuring an object in ES6

// Testing lifecycle method [beforeEach], which let us to run some code before
// any single test case, and is going to move on to the test cases once done() is called.
// In this case we are going to use it to set up the database to ensure it is empty
// in order to pass the expect statemt: expect(todos.length).toBe(1); at the end of
// the [should create a new todo] test case
beforeEach(done => {
  Todo.remove({}).then(() => done()); // Remove all the todos from the database
});

// Use describe to group the test cases in the output of the the terminal
describe('POST /todos', () => {
  // To test async calls you should use the done parameter to tell mocha to wait
  // until done() is called to decide whether or not the test passed
  it('should create a new todo', done => {
    let text = 'Test todo text';
    request(app)
      .post('/todos')
      .send({ text }) // ES6 object syntax. Supertest lib is going to convert the object to json
      .expect(201)
      .expect(res => { // Custom expect assertion to make assertions about the response
        expect(res.body.text).toBe(text);
      })
      // To wrap up the request use end().
      .end((err, res) => { // Checking what was stored in the mongoDB collection instead of passing end(done);
        if (err) { // if any of the expect calls above fail
          return done(err); // return statment to stop the execution of the code
        }

        // Check the mongo db state
        Todo.find().then(todos => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e)); // To catch any error ocurred in the callback. If the catch statement didn't exist the test will never answer, so it's going to fail beacuse of timeout
      });
  });

  it('should not create todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400) // Since in this case we do not need to make assertion about the response we can move on to the end() call right here
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then(todos => {
          expect(todos.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
  });

});
