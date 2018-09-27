const mongoose = require( 'mongoose' );
const User = mongoose.model('User', 'userSchema');
const Child = mongoose.model('Child', 'childSchema');
const Event = mongoose.model('Event');
const fs = require('fs');
const Attendance = mongoose.model('Attendance','attendanceSchema');
const env = process.env.NODE_ENV || 'dev';
const async = require('async');


exports.home = function(req, res){
res.render('./admin/index', {message: req.flash('message')});
}

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
  // User.find({}, function(err, users){
  //   if(err) send('error');
  //   else{
  //     for(var i =0; i< users.length; i++){
  //       const fullname = users[i].firstname+" "+users[i].lastname;
  //       User.findOneAndUpdate({_id: users[i]._id}, {$set: {fullname: fullname}} , function(err, user){
  //         if(err){
  //                    console.log("error");
  //                  }
  //                  else{
  //                    console.log(user.fullname);
  //                  }
  //       });
  //     }
  //   }
  // });
  //
  // Child.find({}, function(err, children){
  //   if(err) res.send("error");
  //   else{
  //     for(var i =0; i<children.length; i++){
  //
  //
  //         Child.findOneAndUpdate({_id: children[i]._id }, {$set: {archived: false}} , function(err, child){
  //           if(err){
  //             console.log("error");
  //           }
  //           else{
  //
  //
  //           }
  //         }
  //       );
  //
  //
  //       if(i == children.length -1){
  //         res.send("success");
  //       }
  //     }
  //
  //   }
  // });
  //
  //
  // Attendance.find({}, function(err, attendances){
  //   if(err) res.send("error");
  //   else{
  //     for(var i =0; i<attendances.length; i++){
  //       currect_date = new Date(attendances[i].date)
  //
  //         console.log(currect_date);
  //         Attendance.findOneAndUpdate({_id: attendances[i]._id }, {$set: {dateStamp: currect_date}} , function(err, attendance){
  //           if(err){
  //             console.log("error");
  //           }
  //           else{
  //             console.log(attendance.date);
  //           }
  //         }
  //       );
  //
  //
  //       if(i == attendances.length -1){
  //         res.send("success");
  //       }
  //     }
  //
  //   }
  // });


}

exports.showUser = function(req, res){
  User.findOne({ _id: req.params.id }, function(err, user) {
    if(err) res.send(err);
    else res.send(user);
  });
}

exports.showChild = function(req, res){
  Child.findOne({ _id: req.params.id }, function(err, child) {
    if(err) res.send(err);
    else res.send(child);
  });
}
