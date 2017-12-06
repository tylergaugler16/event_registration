var mongoose = require('mongoose');

// grab the things we need
var Schema = mongoose.Schema;

// create a schema
var eventSchema = new Schema({
  title: { type: String, required: true, unique: false },
  description: { type: String, required: true, unique: false },
  location: {type: String, required: true, unique: false},
  date: { type: Date, required: true, unique: false }
});

eventSchema.methods.in_the_past = function(){
  return (new Date(this.date) < new Date());
}
eventSchema.methods.formatDate = function(){
  var ampm = (this.date.getHours() >= 12) ? "PM" : "AM";
  return this.date.toDateString() + " " + this.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})+ ' '+ampm;
}


// the schema is useless so far
// we need to create a model using it
var Event = mongoose.model('Event', eventSchema);
module.exports = Event;
