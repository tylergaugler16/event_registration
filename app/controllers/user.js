// var User = require('../models/user.js');
var mongoose = require( 'mongoose' ),
    User = mongoose.model('User', 'userSchema'),
    Child = mongoose.model('Child', 'childSchema'),
    Event = mongoose.model('Event');
   fs = require('fs');

var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var ApplicationHelper = require('../helpers/application_helper.js');

var smtpTransport = nodemailer.createTransport( {
  service: 'SendGrid',
  host: "smtp.sendgrid.net",
  port: '587',
  auth: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_PASSWORD
  }
});

exports.fixOne = function(req, res){
  User.findOne({ email: req.params.email }, function(err, user) {
    console.log(user);
    user.password = user.firstname.toLowerCase() + "1234";
    console.log(user.password);
    user.save(function(err) {
      if(err) res.send(err);
      else res.send('success');
    });

  });
}
exports.fixAll = function(req, res){
  User.updateMany({}, {$set: {
    resetPasswordToken: null ,
    resetPasswordExpires: null
    }
  }, {$unset: false}, function(err){
    if(err) res.send("failed");
    else res.send("success");
  })

  // User.find(function(err, users){
  //   for(var i = 0; i < users.length; i++){
  //     console.log(users[i].resetPasswordToken);
  //   }
  // });
}

exports.list = function(req, res){
  User.find({},function(err, users) {
    if(err) console.log(err);
    else{
      res.render('./users/index',{users: users });
    }
  }).sort({lastname: 1});
};
exports.findUserById = function(req, res){
  User.findOne({ _id: req.params.id }, function(err, user){
    if(err || (user == null)) res.send('could not find user with that id');
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
    else {
      sendWelcomeEmail(user, req.headers.host );
      res.redirect('/users/login');
    }
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

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
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

  var dir = process.env.MBC_PROJECT_DIRECTORY + "/public/user_images/"+req.body.id

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  let path = (req.body.profile_pic)? dir + "/profile_pic.png" : dir +"/"+req.file.originalname;
  console.log(path);
  console.log(req.file.path);
    fs.rename(req.file.path, path , function(err){
      if(err){
        req.flash('message', 'Could not upload image');
        res.redirect('/users/'+req.body.id);
      }
      else{
        res.redirect('/users/'+req.body.id);
        // fs.unlink(path, function() {
        //     if (err) throw err;
        //     else res.redirect('/users/'+req.body.id);
        // });
      }


    });


}
exports.delete = function(req, res){
  deleted_accounts = [];
  User.remove({_id: req.params.id}, function(err, results){
    if (err) res.send('no');
    else{
      console.log(results);
      deleted_accounts.push('Parent');
      Child.find({legal_guardian_id: req.params.id }, function(err, children){
        if(err) res.send('');
        else{
          for(var i =0; i< children.length; i++){
            Child.remove({_id: children[i]._id}, function(err, results){
              if(err) res.send('no')
              else deleted_accounts.push('child');
            });
          }
        }
        res.send(deleted_accounts); // does not wait for deleted_accounts.push('child'); need to refactor
      });
    }
  });
}


exports.forgot_password = function(req, res){

  User.findOne({_id: req.params.id}, function(err, user){
    if(err) {
      console.log("could not find user with that id")
      res.redirect('/');
    }
    else{
      res.render('./users/forgot_password', {user: user});
    }
  });

}

exports.create_password_token = function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/users/forgot_password');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {

      var mailOptions = {
        to: user.email,
        from: 'Maspeth Bible Church <support@maspethbiblechurch.com>',
        subject: 'Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err, info) {
        if(err)console.log(err);
        req.flash('message', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};



exports.reset_password = function(req, res){
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('message', 'Password reset token is invalid or has expired.');
      return res.redirect('/');
    }
    res.render('./users/reset_password', { user: req.user, token: req.params.token });
  });
}

exports.reset_password_post = function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('message', 'Password reset token is invalid or has expired.');
          return res.redirect('/');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          if(err){
            req.flash('message', 'Your password was not changed. Please try again.');
            res.redirect('/');
          }
          done(err, user);

        });
      });
    },
    function(user, done) {
      var mailOptions = {
        to: user.email,
        from: 'Maspeth Bible Church <support@maspethbiblechurch.com>',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    if(err)console.log(err);
    res.redirect('/users/login');
  });
};


  exports.get_profile_picture = function(req, res){
    file = ApplicationHelper.get_profile_picture_file(req.body.id);
    var bitmap = fs.readFileSync(file);
    res.send(bitmap.toString('base64'));
  }


function sendWelcomeEmail(user, hostname){

  var mailOptions = {
    to: user.email,
    from: 'Maspeth Bible Church <support@maspethbiblechurch.com>',
    subject: 'Thank you for registering at register.maspethbiblechurch.com',
    text: 'You are receiving this because you have created an account at register.maspethbiblechurch.com. If you did not create an account, but are registered for Open Gym, we may have created an account for you with the email you submitted on our paper registration sheet. Your password is your first name followed by "1234". If your child is part of our open gym program, please log in and press the "Register your children for Open Gym button" on your profile page(this is the page that you are redirected to after logging in) to compelete the registration process.\n\n' +
      'To sign in, click on the following link:\n\n' +
      'http://' + hostname+ '/users/login\n\n'
  };
  smtpTransport.sendMail(mailOptions, function(err, info) {
    if(err)console.log(err);
    done(err, 'done');
  });

}
