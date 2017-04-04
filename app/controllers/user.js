// var User = require('../models/user.js');
var mongoose = require( 'mongoose' ),
    User = mongoose.model('User', 'userSchema');

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
      res.render('./users/show',{user: user});
    }
  });
};
exports.create = function(req, res){
  var user = new User(req.body);
  console.log(user);
  console.log(req.body);
  user.save(function(err){
    if(err) res.redirect('/users/signup');
    else res.redirect('/users/'+user._id);
  });
}
exports.signup = function(req, res){
  res.render('./users/signup', {error: ''});
}
