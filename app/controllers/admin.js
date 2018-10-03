const mongoose = require( 'mongoose' );
const User = mongoose.model('User', 'userSchema');
const Child = mongoose.model('Child', 'childSchema');
const Event = mongoose.model('Event');
const fs = require('fs');
const Attendance = mongoose.model('Attendance','attendanceSchema');
const env = process.env.NODE_ENV || 'dev';
const async = require('async');
var attendanceHelper = require('../helpers/attendance_helper.js');



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
  // attendanceHelper.getAttendanceForUser("5b9d40a3d1408c5f4e2624f6", false);
  // res.send("ye");
console.time('test');
  attendanceHelper.getAttendanceStatisticsOnUser("5b9d40a3d1408c5f4e2624f4", false, function(err, result){
console.log(result.attendancesForUser)
  });
  console.timeEnd('test');
  res.send('yeet');

  // User.findOne({ _id: '5b9d30083e33585cc0b8c710' }).then((user) =>{
  //   return user.children;
  // }).then((children_ids) =>{
  //   return Child.find({_id: {$in: children_ids}})
  // }).then((children) => {
  //   res.send(children);
  // }).catch((err) =>{
  //   res.send(err);
  // })
//   .populate('children child').exec((err, doc) => {
//     if (err) { return console.error(err); }
//     console.log(doc);
//     res.send(doc.children);
// })

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
