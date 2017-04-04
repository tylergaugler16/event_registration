var mongoose = require('mongoose');

// grab the things we need
var Schema = mongoose.Schema;

// create a schema
var childSchema = new Schema({
  firstname: { type: String, required: true, unique: false },
  lastname: { type: String, required: true, unique: false },
  email: { type: String, sparse: true, unique: true },
  address: {type: String, required: false, unique: false},
  legal_guardian_id: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  registered_for_og: {type: Boolean, default: false},
  created_at: Date,
  updated_at: Date
});



// on every save, add the date
childSchema.pre('save', function(next) {

  var currentDate = new Date();
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

//VALIDATE EMAIL
  var email_regex =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if(this.email && !email_regex.test(this.email)){
    var err = new Error('WRONG EMAIL FORMAT');
    next(err);
  }
  else{
    next();
  }

});

childSchema.methods.full_name = function(){
  return this.firstname + " " + this.lastname;
}

childSchema.methods.get_gaurdians = function(){
  return this.legal_guardian_id;
}


// the schema is useless so far
// we need to create a model using it
var Child = mongoose.model('Child', childSchema);

// make this available to our childs in our Node applications
module.exports = Child;
