const mongoose = require('mongoose');
const  bcrypt = require('bcrypt');
const   SALT_WORK_FACTOR = 10;

const Child = mongoose.model('Child', 'childSchema');
const Event = mongoose.model('Event', 'eventSchema');
const salt = bcrypt.genSaltSync(10);
const mailchimp = require('../../config/mailchimp.js');
const fs = require('fs');
// grab the things we need
const Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  firstname: { type: String, required: true, unique: false },
  lastname: { type: String, required: true, unique: false },
  fullname: {type: String, unique: false},
  email: { type: String, required: true, unique: true },
  phone_number: [{type: String, required: true, unique: true}],
  password: {type: String, required: true},
  profile_url: {type: String, required: false, default: 'https://s3.amazonaws.com/maspethbiblechurch-images/user-placeholder.jpg' },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  church: {type: String, required:false },
  address: {type: String, required: true},
  city: {type: String, required: true},
  zip_code: {type: String, required: true},
  status: {type: String, required: true, unique:false}, // child, parent, helper, admin (only works for open gym, should change)
  archived: {type: Boolean, default: false},
  children: [{type: mongoose.Schema.Types.ObjectId, ref: 'Child'}],
  eventsRegisteredFor: [{type: mongoose.Schema.Types.ObjectId, ref: 'Event'}],
  created_at: Date,
  updated_at: Date
});


// on every save, add the date
userSchema.pre('save', true, function(next, done) {
  var user = this;
  var currentDate = new Date();
  this.updated_at = currentDate;
  this.fullname = this.firstname+ " "+this.lastname;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

//VALIDATE EMAIL
  var email_regex =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if(!email_regex.test(this.email)){
    var err = new Error('Incorrect Email Format');
    next(err);
  }
  var phone_regex =/((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/
  if(!phone_regex.test(this.phone_number)){
    var err = new Error('Incorrect Phone Number');
    next(err);
  };

// only hash password if it has been modified.
// since done() is called here, make sure only the bycrpt hash is below this
  if (!this.isModified('password')) done();
    // hash the password along with our new salt

    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);

        user.password = hash;
        next();
    });
    done();
});

userSchema.post('save', function(user){
  mailchimp(user);
});

userSchema.post('findOneAndUpdate', function(user){
  User.updateChildren(user.children, valuesToUpdate);
  mailchimp(user);
})



// METHODS

userSchema.methods.full_name = function(){
  return this.firstname + " " + this.lastname;
}
userSchema.methods.initials = function(){
  return this.firstname.charAt(0) +" " + this.lastname.charAt(0);
}
userSchema.methods.full_address = function(){
  return this.address +" "+ this.city +" NY, "+ this.zip_code;
}

userSchema.methods.needsToBeUpdatedForFall = function(){
  if(new Date("9-1-2018") > this.updated_at){
    return true;
  }
  else return false;
}

userSchema.methods.is_admin = function(){
  return this.status == 'admin'
}
userSchema.methods.is_super_admin = function(){
  return this.email == 'tylergaugler16@gmail.com'
}
userSchema.methods.get_profile_picture = function(){
  if (fs.existsSync('public/user_images/'+this._id+'/profile_pic.png')) {
      return '/user_images/'+this._id+'/profile_pic.png';
  }
  else{
      return '/images/user-placeholder.jpg'
  }
}
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
}
userSchema.methods.updatePassword = function(new_password, next){
  // this.password = bcrypt.hashSync(new_password , 10);
  // this.save(function(err){
  //   if(err) console.log(err);
  //   else next();
  // })

  // bcrypt.hash(new_password, salt, function(err, hash) {
  //     if (err) return next(err);
  //     user.password = hash;
  //     next();
  // });
}

userSchema.methods.getChildren = function(){
  return Child.find( { legal_guardian_id: this._id });
}
userSchema.methods.getEvents = function(){
  return Event.find({_id: { $in: this.eventsRegisteredFor} });
}

// Statics

userSchema.statics.getUser = function(user_id){
  return User.find( { _id: user_id });
}

userSchema.statics.removeChildren = function(children_ids){
  Child.deleteMany({_id: {$in: children_ids} }, function(err){
    if(err)console.log(err);
    else{
      console.log("deleted children: ",children_ids);
    }
  })
}


// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
