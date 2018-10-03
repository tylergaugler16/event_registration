const fs = require('fs');
// get models
const mongoose = require( 'mongoose' );
const User = mongoose.model('User', 'userSchema');
const Child = mongoose.model('Child', 'childSchema');
const Event = mongoose.model('Event', 'eventSchema');
const Attendance = mongoose.model('Attendance','attendanceSchema');


exports.getAttendanceForUser = function(user_id, is_user){

  const query = {};
  if(is_user){
    query['staff.staff_id'] = user_id;
  }
  else{
    query['children.child_id'] = user_id;
  }
    return Attendance.find(query);
}

const getAttendanceForUser = function(user_id, is_user){

  const query = {};
  if(is_user){
    query['staff.staff_id'] = user_id;
  }
  else{
    query['children.child_id'] = user_id;
  }
    return Attendance.find(query);
}




exports.getAttendanceStatisticsOnUser = function(user_id, is_user, next){
  let allAttendance = null;
  Attendance.find({}).sort({dateStamp: 1})
  .then(function(attendance){
    allAttendance = attendance;
    return getAttendanceForUser(user_id, is_user)
  })
  .then(function(attendance_for_user){
    console.log(attendance_for_user);
    next(null, {allAttendances: allAttendance, attendancesForUser: attendance_for_user.map(x => x._id)  });
  })
  .catch(function(err){
    console.log(err);
      next(err, null);
  });
}
