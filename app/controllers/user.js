var User = require('../models/user.js');

exports.list = function(req, res){
  User.find(function(err, users) {
    res.render('./users/index',{users: users})
  });
};
exports.findUserById = function(req, res){
  console.log(req.params.id);
  User.find({_id: req.params.id}, function(err,user){
    console.log(user.full_name);
    if(err) res.send('could not find user with that id');
    else res.send(user);
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
