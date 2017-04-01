var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/event-registration');

// grab the things we need
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  firstname: { type: String, required: true, unique: false },
  lastname: { type: String, required: true, unique: false },
  email: { type: String, required: true, unique: true },
  status: {type: String, required: false, unique:false}, // child, parent, helper, admin (only works for open gym, should change)
  created_at: Date,
  updated_at: Date
});

userSchema.methods.dudify = function() {
  this.firstname = this.firstname + '-dude';
  return this.firstname;
};

// on every save, add the date
userSchema.pre('save', function(next) {

  var currentDate = new Date();
  this.updated_at = currentDate;

  if (!this.created_at)
    this.created_at = currentDate;

  var email_regex =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if(!email_regex.test(this.email)){
    var err = new Error('WRONG EMAIL FORMAT');
    next(err);
  }
  else{
    next();
  }

});

// methods




// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
