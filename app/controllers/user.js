// var User = require('../models/user.js');
var mongoose = require( 'mongoose' ),
    User = mongoose.model('User', 'userSchema'),
    Child = mongoose.model('Child', 'childSchema'),
    Event = mongoose.model('Event');



exports.list = function(req, res){
  User.find(function(err, users) {
    if(err) console.log(err);
    else{
      res.render('./users/index',{users: users});
    }
  });
};
exports.findUserById = function(req, res){
  User.findOne({ _id: req.params.id }, function(err, user){
    if(err) res.send('could not find user with that id');
    else{
      Child.find({legal_guardian_id: user._id }, function(err, children){
        if(err) console.log("error finding users childrend");
        else{
          Event.find({_id: { $in: user.eventsRegisteredFor }}, function(err, events){
            if(err) console.log("error finding events for user in findUserById method");
            else res.render('./users/show',{user: user, children: children, registered_events: events});
          })

        }

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
    else res.redirect('/users/login');
  });
}
exports.signup = function(req, res){
  res.render('./users/signup', {error: ''});
}

exports.login = function(req, res){
  res.render('./users/login');
}

exports.signin = function(req, res){
  res.redirect('/users/'+req.user._id);
  // User.findOne({email: req.body.email}, function(err, user){
  //   if(err) res.render('./users/login',{error: 'Incorrect Email'});
  //   else{
  //     user.comparePassword(req.body.password, function(err, isMatch){
  //       console.log(isMatch);
  //       if(err || !isMatch) res.render('./users/login',{error: 'Incorrect Password'});
  //       else {
  //         req.session.user = user;
  //         res.redirect('/users/'+user._id);
  //       }
  //     });
  //   }
  // });
}

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
}
