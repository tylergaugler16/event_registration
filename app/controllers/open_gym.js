var mongoose = require( 'mongoose' ),
    Child = mongoose.model('Child', 'childSchema'),
    User = mongoose.model('User', 'userSchema');

exports.info = function(req, res){
  res.render('./open_gym/info');
}

exports.register = function(req, res){
  console.log(req.user);
  if(req.user.status == 'parent'){
    res.render('./open_gym/register', {role: 'parent'});
  }
  else res.send('not working');
}

exports.register_children = function(req,res){
  console.log(req.body.firstname);
  console.log(req.body.firstname.length);
  if(req.body.firstname instanceof Array){
    console.log("heree");
    for(var i = 0;i < req.body.firstname.length;i++){
      var d = req.body.birthday[i].split('-');
      var child = new Child({
        firstname: req.body.firstname[i],
        lastname: req.body.lastname[i],
        legal_guardian_id: req.body.legal_guardian_id[i],
        address: req.body.address[i],
        zip_code: req.body.zip_code[i],
        emergency_contact_name: req.body.emergency_contact_name[i],
        emergency_contact_phone: req.body.emergency_contact_phone[i],
        birthday: Date.UTC(d[2], d[1], d[0]),
        permission_to_walk: (req.body.permission_to_walk[i] == 'yes')? true : false,
        media_agreement: (req.body.media_agreement[i] == 'yes')? true : false
      });
      console.log(child);
      child.save(function(err){
        console.log("trying to save");
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
    }//for

  }
  else{
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



res.sendStatus(200);
}
