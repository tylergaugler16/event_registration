// var User = require('../models/user.js');
var mongoose = require( 'mongoose' ),
    User = mongoose.model('User', 'userSchema'),
    Child = mongoose.model('Child', 'childSchema');

// to update my password or anything else
// User.findOne({_id: '58e6a01dc375513e12332508'}, function(err, user){
//       if (err) console.log(err);
//       else{
//         user.password = 'foobar1234';
//         user.save(function(err){
//           if(err)console.log(err);
//         });
//       }
//     });

exports.list = function(req, res){
  User.find(function(err, users) {
    if(err) console.log(err);
    else{
      console.log(users);
      res.render('./users/index',{users: users});
    }

  });
};
exports.findUserById = function(req, res){
  User.findOne({ _id: req.params.id }, function(err, user){
    if(err) res.send('could not find user with that id');
    else{
      console.log(user);
      // var id = user._id;
      Child.find({legal_guardian_id: user._id }, function(err, children){
        if(err) console.log(err);
        else res.render('./users/show',{user: user, children: children});
      });
    }
  });
};
exports.create = function(req, res){
  var user = new User(req.body);
  console.log(user);
  console.log(req.body);
  user.save(function(err){
    console.log(err);
    if(err) res.redirect('/users/signup');
    else res.redirect('/users/'+user._id);
  });
}
exports.signup = function(req, res){
  res.render('./users/signup', {error: ''});
}

exports.login = function(req, res){
  res.render('./users/login');
}

exports.signin = function(req, res){
  User.findOne({email: req.body.email}, function(err, user){
    if(err) res.render('./users/login',{error: 'Incorrect Email'});
    else{
      user.comparePassword(req.body.password, function(err, isMatch){
        console.log(isMatch);
        if(err || !isMatch) res.render('./users/login',{error: 'Incorrect Password'});
        else res.redirect('/users/'+user._id);
      });
    }
  });
}
