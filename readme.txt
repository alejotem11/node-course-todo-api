Description:
APIs (using express) to interact with a mongodb
Bcrypt hashing
Authorization JWT Token

To run it locally:
Run the command:
mongod
then, in other terminal window run:
node server/server.js

To test it: (with mongo server up (mongod))
npm test
ó
npm run test-watch (custom script)

Import the collection and the environments from the <postman> directory in Postman

The app is also deployed on heroku (https://arcane-chamber-70940.herokuapp.com)

The config/config.json wouldn't be commited to the github repo

/playground/mongodb-connect.js  --> See the use of the mongo native library (mongodb)
/playground/hashing.js          --> Hash with sha256, JWT and bcrypt
