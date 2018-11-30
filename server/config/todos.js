const env = process.env.NODE_ENV;

switch (env) {
  case 'test':
      // Running the test cases with mocha
      // Set up the NODE_ENV variable environment = test in the test script of
      // the package.json file
      process.env.MONGODB_URL = 'mongodb://localhost:27017/nodejs-course-test';
      process.env.PORT = 3000;
      break;
  case 'production': // Heroku
      // When you deploy to heroku it automatically set the NODE_ENV = production
      // and assign a random value to the PORT variable environment
      // Database created on https://mlab.com/home
      process.env.MONGODB_URL = 'mongodb://todoapp1:todoapp1@ds121624.mlab.com:21624/nodecourse-todoapi';
      break;
  default: // Development
    process.env.MONGODB_URL = 'mongodb://localhost:27017/nodejs-course';
    process.env.PORT = 3000;
}
