// var User = require('../models/user.js');
var mongoose = require( 'mongoose' ),
    User = mongoose.model('User', 'userSchema'),
    Child = mongoose.model('Child', 'childSchema'),
    Event = mongoose.model('Event');
   fs = require('fs');
  var Attendance = mongoose.model('Attendance','attendanceSchema');

var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
// var ApplicationHelper = require('../helpers/application_helper.js');
var mkdirp = require('mkdirp');
var AWS = require('aws-sdk');
var myBucket = 'maspethbiblechurch-images';
var s3Bucket = new AWS.S3( { params: {Bucket: myBucket } } )


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
  // User.updateMany({}, {$set: {
  //     profile_url: 'https://s3.amazonaws.com/maspethbiblechurch-images/user-placeholder.jpg',
  //   }
  // }, {$unset: false}, function(err){
  //   if(err) res.send("failed");
  //   else res.send("success");
  // })

  // Child.find({}, function(err, children){
  //   if(err) res.send("error");
  //   else{
  //     for(var i =0; i<children.length; i++){
  //       if(!children[i].fullname){
  //         const fullName = children[i].firstname + " "+ children[i].lastname;
  //
  //         Child.findOneAndUpdate({_id: children[i]._id }, {$set: {fullname: fullName}} , function(err, child){
  //           if(err){
  //             console.log("error");
  //           }
  //           else{
  //             console.log(child.fullname);
  //
  //           }
  //         }
  //       );
  //
  //     }// if
  //       if(i == children.length -1){
  //         res.send("success");
  //       }
  //     }
  //
  //   }
  // });
  Attendance.find({}, function(err, attendances){
    if(err) res.send("error");
    else{
      for(var i =0; i<attendances.length; i++){
        currect_date = new Date(attendances[i].date)

          console.log(currect_date);
          Attendance.findOneAndUpdate({_id: attendances[i]._id }, {$set: {dateStamp: currect_date}} , function(err, attendance){
            if(err){
              console.log("error");
            }
            else{
              console.log(attendance.date);
            }
          }
        );


        if(i == attendances.length -1){
          res.send("success");
        }
      }

    }
  });

  // User.find(function(err, users){
  //   for(var i = 0; i < users.length; i++){
  //     console.log(users[i].resetPasswordToken);
  //   }
  // });
}
exports.send_all_email = function(req, res){
  User.find({},function(err, users) {
    if(err) console.log(err);
    else{
      console.log(users.length);
      for(var i = 0; i< users.length; i++){
        console.log("sent to "+users[i].email);
        send_initial_email(users[i], req.headers.host);
      }
    }
  });
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
  console.log("In User show");
  User.findOne({ _id: req.params.id }, function(err, user){

    if(err || (user == null)) res.send('could not find user with that id');
    else{
      console.log(user);
      Child.find({legal_guardian_id: user._id }, function(err, children){
        if(err) console.log("error finding users children");
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
  if(res.locals.current_user.is_admin && req.body.email != null){
    new_data["email"] = req.body.email;
  }
  User.findOneAndUpdate({_id: req.body.id}, {$set: new_data}, function(err, user){
    if(err){
      console.log("error trying to update"+user.firstname+" "+user.lastname);
    }
    else{
      res.redirect('/users/'+req.body.id);

    }
  });
}


// my s3 bucket will only last 12 months. On March 19th, 2019, I will need to
// transfer all uploaded images from this current bucket to a bucket on another account.
exports.upload_photo = function(req, res){
  if(!req.file){
    req.flash('error_message', 'Could not upload image');
    res.redirect('/users/'+req.body.id);
  }

  var stream = fs.createReadStream(req.file.path)
  var params = {
    Bucket: myBucket,
    Key: 'profile_pictures/'+req.body.id,
    Body: stream,
    ContentType: req.file.mimetype,
    ACL: 'public-read'
  }
  s3Bucket.putObject(params, function(err, data){
  if (err) { req.flash('error_message', 'Could not upload image');
      res.redirect('/users/'+req.body.id);
    } else {
       req.flash('error_message', 'Uploaded image');
       saveProfilePictureUrl(req.body.id);
       res.redirect('/users/'+req.body.id);
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
          req.flash('error_message', 'No account with that email address exists.');
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
        req.flash('success_message', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
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
      req.flash('error_message', 'Password reset token is invalid or has expired.');
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
          req.flash('error_message', 'Password reset token is invalid or has expired.');
          return res.redirect('/');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          if(err){
            req.flash('error_message', 'Your password was not changed. Please try again.');
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
        req.flash('success_message', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    if(err)console.log(err);
    res.redirect('/users/login');
  });
};



function saveProfilePictureUrl(id){
  var url = 'https://s3.amazonaws.com/maspethbiblechurch-images/profile_pictures/'+id;
  User.findOneAndUpdate({_id: id}, { profile_url: url }, function(err, user){
    if(err) console.log(err);
    else console.log(url);
  });
}

function sendWelcomeEmail(user, hostname){
  var mailOptions = {
    to: user.email,
    from: 'Maspeth Bible Church <support@maspethbiblechurch.com>',
    subject: 'Thank you for registering for Open Gym at Maspeth Bible Church',
    text: 'You are receiving this because you have created an account at register.maspethbiblechurch.com. If you did not create an account, but are registered for Open Gym, we may have created an account for you with the email you submitted on our paper registration sheet. Your password is your first name followed by "1234". If your child is part of our open gym program, please log in and press the "Register your children for Open Gym button" on your profile page(this is the page that you are redirected to after logging in) to compelete the registration process.\n\n' +
      'To sign in, click on the following link:\n\n' +
      'http://' + hostname+ '/users/login\n\n'
  };
  smtpTransport.sendMail(mailOptions, function(err, info) {
    if(err)console.log(err);
    done(err, 'done');
  });
}

function send_initial_email(user, hostname){
  var mailOptions = {
    to: user.email,
    from: 'Maspeth Bible Church <support@maspethbiblechurch.com>',
    subject: 'Thank you for registering for Open Gym at Maspeth Bible Church',
    text: 'You are receiving this because you have created an account at register.maspethbiblechurch.com. If you did not create an account, but are registered for Open Gym, we may have created an account for you with the email you submitted on our paper registration sheet. Your password is your first name followed by "1234". If you would like to change your password, go to http://'+hostname+'/users/forgot_password\n\n'+
    'If your child is part of our open gym program, please log in and press the "Register your children for Open Gym" button on your profile page(this is the page that you are redirected to after logging in) to compelete the registration process.\n\n' +
    'To help us out, please upload a profile picture of yourself along with your child. At this moment you can only upload one picture, so if you have multiple children please use a photo with everyone. This is for our sign out process, so we have a face of who is picking up the children. To do this, go to your profile page (this is the page that you are redirected to after logging in) and click "choose file" and after selecting one, make sure to click "submit".\n\n' +
      'To sign in, click on the following link:\n\n' +
      'http://' + hostname+ '/users/login\n\n'
  };
  smtpTransport.sendMail(mailOptions, function(err, info) {
    if(err)console.log(err);
    done(err, 'done');
  });
}
