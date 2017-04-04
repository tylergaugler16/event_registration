var mongoose = require( 'mongoose' ),
    Child = mongoose.model('Child', 'childSchema'),
    User = mongoose.model('User', 'userSchema'),
    pretend_role = 'parent',
    ObjectId = require('mongodb').ObjectID;
exports.info = function(req, res){
  res.send('OPEN GYM INFO');
}

exports.register = function(req, res){
  if(pretend_role == 'parent'){
    res.render('./open_gym/register', {role: 'parent'});
  }
  else res.send('not working');
  //   var child = new Child(
  //   {
  //     firstname: 'Test',
  //     lastname: 'Child',
  //     legal_guardian_id: ['58e2a3438e1fa8658c8e18f8']
  //   }
  // )
  // res.send(child);
  // res.render('./open_gym/register');
}

exports.register_children = function(req,res){
  // console.log(req.body.firstname.length);
  if(req.body.construtor === Array){
    console.log('TRYING TO REGISTER MULTIPLE CHILDREN');
  }
  else{
    req.body.firstname = [req.body.firstname];
    req.body.lastname = [req.body.lastname];
    req.body.legal_guardian_id  = [req.body.legal_guardian_id];
  }
  var number_of_kids = req.body.firstname.length;
  for(var i = 0; i < number_of_kids; i++ ){
    var child = new Child({
      firstname: req.body.firstname[i],
      lastname: req.body.lastname[i],
      legal_guardian_id: req.body.legal_guardian_id[i]
    });
    child.save(function(err){
      if(err) console.log(err);
      else{
        console.log('child registered');
        User.update({_id: req.body.legal_guardian_id[0]},{$addToSet: {children: child}}, function(err, user){
              if(err) console.log(err);
              else console.log(user);
            });
      }
    });
  }
  res.send('yeet');

  // req.body.legal_guardian_id = ObjectId(req.body.legal_guardian_id);
  // var child = new Child(req.body);
  // console.log(child);
  // child.save(function(err){
  //   if(err)console.log(err);
  //   else {
  //     console.log('saved!');
  //     User.update({_id: req.body.legal_guardian_id},{$addToSet: {children: child}}, function(err, user){
  //       if(err) console.log(err);
  //       else console.log(user);
  //     });
  //   }
  // });
  // res.send('yeet');

}
