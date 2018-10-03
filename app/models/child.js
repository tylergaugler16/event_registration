var mongoose = require('mongoose');

// grab the things we need
var Schema = mongoose.Schema;

// create a schema
var childSchema = new Schema({
  firstname: { type: String, required: true, unique: false },
  lastname: { type: String, required: true, unique: false },
  fullname: {type: String, unique: false},
  address: {type: String, required: true, unique: false},
  city: {type: String, required: true},
  zip_code: {type: String, required: true},
  emergency_contact_name: {type: String, required: true},
  emergency_contact_phone: {type: String, required: true},
  medical_notes: {type: String, default: 'none'},
  birthday: {type: Date, required: true},
  permission_to_walk: {type: Boolean, default: false},
  media_agreement: {type: Boolean, default: false},
  legal_guardian_id: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  registered_for_og: {type: Boolean, default: false},
  on_waiting_list: {type: Boolean, default: true},
  archived:  {type: Boolean, default: false},
  created_at: Date,
  updated_at: Date
});



// on every save, add the date
childSchema.pre('save', function(next) {

  this.fullname = this.full_name();
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

childSchema.methods.get_gaurdian = function(){
  return this.legal_guardian_id[0];
}
childSchema.methods.initials = function(){
  return this.firstname.charAt(0) +" " + this.lastname.charAt(0);
}
childSchema.methods.initials = function(User){
  return User.find({_id: this.legal_guardian_id[0]});
}

childSchema.statics.updateChildren = function(children_ids, valuesToUpdate, childModel){

  console.log("I'M HERE");
  console.log(children_ids);
  childModel.find({_id: "5b9d3f23d1408c5f4e2624f3" }).then(function(children){
    console.log("children", children);
  });
  childModel.find({ _id: {$in: ["5b9d3f23d1408c5f4e2624f3"]} }, function(err, children){
    if(!err)console.log("children", children);
    else{ console.log(children);}
  })
  childModel.updateMany({ _id: {$in: children_ids} }, {archived: true}, function(err, users){
    if(!err)console.log(users);
    else{console.log(users)}
  })

}

// the schema is useless so far
// we need to create a model using it
var Child = mongoose.model('Child', childSchema);

// make this available to our childs in our Node applications
module.exports = Child;
