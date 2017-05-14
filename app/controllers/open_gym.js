var mongoose = require( 'mongoose' ),
    Child = mongoose.model('Child', 'childSchema'),
    User = mongoose.model('User', 'userSchema');

exports.info = function(req, res){
  res.render('./open_gym/info');
}

exports.register = function(req, res){

  if(pretend_role == 'parent'){
    res.render('./open_gym/register', {role: 'parent'});
  }
  else res.send('not working');
}

exports.register_children = function(req,res){
  console.log("heeree");
  var d = req.body.birthday.split('-');
  var child = new Child({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    legal_guardian_id: req.body.legal_guardian_id,
    address: req.body.address,
    zip_code: req.body.zip_code,
    emergency_contact_name: req.body.emergency_contact_name,
    emergency_contact_phone: req.body.emergency_contact_phone,
    birthday: Date.UTC(d[2], d[1], d[0]),
    permission_to_walk: (req.body.permission_to_walk == 'yes')? true : false,
    media_agreement: (req.body.media_agreement == 'yes')? true : false
  });
  child.save(function(err){
    if(err) console.log(err);
    else{
      console.log('child registered');
      console.log(child);
      User.update({_id: req.body.legal_guardian_id},{$addToSet: {children: child}}, function(err, user){
            if(err) console.log(err);
            else console.log(user);
          });
    }
  });
  console.log(req.body);


}
