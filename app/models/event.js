var mongoose = require('mongoose');

// grab the things we need
var Schema = mongoose.Schema;

// create a schema
var eventSchema = new Schema({
  title: { type: String, required: true, unique: false },
  description: { type: String, required: true, unique: false },
  location: {type: String, required: true, unique: false},
  date: { type: Date, required: true, unique: false },
});


// the schema is useless so far
// we need to create a model using it
var Event = mongoose.model('Event', eventSchema);
module.exports = Event;
