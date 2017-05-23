var mongoose = require('mongoose');

// grab the things we need
var Schema = mongoose.Schema;

// create a schema
var attendanceSchema = new Schema({
  date: { type: String, required: true, unique: true },
  children_present: [{type: mongoose.Schema.Types.ObjectId, ref: 'Child'}]
});

// eventSchema.methods.in_the_past = function(){
//   return (new Date(this.date) < new Date());
// }
// eventSchema.methods.formatDate = function(){
//   return this.date.toDateString() + " " + this.date.toLocaleTimeString();
// }


// the schema is useless so far
// we need to create a model using it
var Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
