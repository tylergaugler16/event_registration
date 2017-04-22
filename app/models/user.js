var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;
var salt = bcrypt.genSaltSync(10);
// grab the things we need
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  firstname: { type: String, required: true, unique: false },
  lastname: { type: String, required: true, unique: false },
  email: { type: String, required: true, unique: true },
  phone_number: [{type: String, required: false, unique: true}],
  password: {type: String, required: true, unique: true},
  church: {type: String, required:false },
  address: {type: String, required: false},
  status: {type: String, required: false, unique:false}, // child, parent, helper, admin (only works for open gym, should change)
  children: [{type: mongoose.Schema.Types.ObjectId, ref: 'Child'}],
  eventsRegisteredFor: [{type: mongoose.Schema.Types.ObjectId, ref: 'Event'}],
  created_at: Date,
  updated_at: Date
});

userSchema.methods.dudify = function() {
  // add some stuff to the users name
  this.firstname = this.firstname + '-dude';

  return this.firstname;
};

// on every save, add the date
userSchema.pre('save', true, function(next, done) {
  var user = this;
  var currentDate = new Date();
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

//VALIDATE EMAIL
  var email_regex =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if(!email_regex.test(this.email)){
    var err = new Error('WRONG EMAIL FORMAT');
    next(err);
  }

// only hash password if it has been modified
  if (!this.isModified('password')) return next();
    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
    done();
});



// METHODS

userSchema.methods.full_name = function(){
  return this.firstname + " " + this.lastname;
}

userSchema.methods.is_admin = function(){
  return this.status == 'admin'
}
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
}

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
