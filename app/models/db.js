// Bring Mongoose into the app
var mongoose = require( 'mongoose' );
mongoose.Promise = global.Promise;
// assert.equal(query.exec().constructor, global.Promise);
// Build the connection string
var env = process.env.NODE_ENV || 'dev';
var dbURI = (env == 'dev')? 'mongodb://localhost/event-registration' : process.env.MONGODB_URI;

// Create the database connection
mongoose.connect(dbURI);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});


// BRING IN YOUR SCHEMAS & MODELS
require('./event');
require('./child');
require('./user');
