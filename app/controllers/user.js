// var User = require('../models/user.js');
var mongoose = require( 'mongoose' ),
    User = mongoose.model('User', 'userSchema'),
    Child = mongoose.model('Child', 'childSchema'),
    Event = mongoose.model('Event');
   fs = require('fs');



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
      console.log(user);
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
  req.body.email = req.body.email.toLowerCase();
  // req.body.address = req.body.address +" " +req.body.city+", NY";
  if(req.body.phone_number.length == 10 && /^\d+$/.test(req.body.phone_number)){
    req.body.phone_number = req.body.phone_number.substr(0,3)+"-"+req.body.phone_number.substr(3,3)+"-"+req.body.phone_number.substr(6,4);
  }
  else if(req.body.phone_number.length == 11 && /^\d+$/.test(req.body.phone_number)){
     req.body.phone_number = req.body.phone_number.substr(0,4)+"-"+req.body.phone_number.substr(4,3)+"-"+req.body.phone_number.substr(7,4);
   }
  console.log(req.body.address);
  var user = new User(req.body);
  console.log(user);
  console.log(req.body);
  user.save(function(err){
    console.log(err);
    if(err) {
      req.flash('message', err.message);
      res.redirect('/');
    }
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
  // req.flash('message', 'You are logged in!');
  res.redirect('/users/'+req.user._id);
}
exports.edit = function(req, res){
  User.findOne({ _id: req.params.id }, function(err, user){
    if(err) res.send('could not find user with that id');
    else{
      if( (res.locals.current_user._id.toString() == user._id.toString()) || res.locals.current_user.status == 'admin'){
        res.render('./users/edit', {user: user});
      }
      else{
        res.send("You don't have permission to edit this user " + user._id+" " + res.locals.current_user._id);
      }
    }
  });
}
exports.update = function(req, res){
  var new_data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    church: req.body.church,
    address: req.body.address,
    city: req.body.city,
    zip_code: req.body.zip_code,
    phone_number: req.body.phone_number
  }
  User.findOneAndUpdate({_id: req.body.id}, {$set: new_data}, function(err, user){
    if(err){
      console.log("error");
    }
    else{
      console.log(user);
      res.redirect('/users/'+req.body.id);

    }
  });
}

exports.upload_photo = function(req, res){
  if(!req.file){
    req.flash('message', 'Could not upload image');
    res.redirect('/users/'+req.body.id);
  }
  var dir = "public/user_images/"+req.body.id

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
  var path = (req.body.profile_pic)? dir + "/profile_pic.png" : dir +"/"+req.file.originalname;

    fs.rename(req.file.path, path , function(err){
      if(err){
        req.flash('message', 'Could not upload image');
        res.redirect('/users/'+req.body.id);
      }
      else res.redirect('/users/'+req.body.id);
    });


}
exports.delete = function(req, res){

}

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
}
