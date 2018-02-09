var mongoose = require('mongoose');

// grab the things we need
var Schema = mongoose.Schema;

// create a schema
var attendanceSchema = new Schema({
  date: { type: String, required: true, unique: true },
  children: [{
    child_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Child', unique: true},
    sign_in_time: { type: String, required: true },
    signed_out: {type: Boolean, default: false },
    signed_out_time: { type: String }
  }]
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
