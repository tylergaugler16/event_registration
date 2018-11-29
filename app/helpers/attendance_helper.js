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


// @returns query of all attendance sheets that user has signed in on
//
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


// @returns a hash:
// {
//   allAttendance:
//   attendancesForUser:
// }
// where allAttendance is all attendance sheets created,
// and attendancesForUser are the attendance sheets that the user has signed in on
exports.getAttendanceStatisticsOnUser = function(user_id, is_user, next){
  let allAttendance = null;
  Attendance.find({}).sort({dateStamp: 1})
  .then(function(attendance){
    allAttendance = attendance;
    return getAttendanceForUser(user_id, is_user)
  })
  .then(function(attendance_for_user){
    next(null, {allAttendances: allAttendance.map(x => x._id), attendancesForUser: attendance_for_user.map(x => x._id)  });
  })
  .catch(function(err){
    console.log(err);
      next(err, null);
  });
}



exports.ageOfChildrenBreakdown = function(attendance){
  const breakdown = {
    "0-5": 0,
    "6-8": 0,
    "9-11": 0,
    "12-14": 0,
  };

  for(let i =0; i< attendance.children.length;i++){
    let age = attendance.children[i].age;
    console.log(age);
    if(age < 6){
      breakdown["0-5"]++;
      break;
    }
    else if(age < 9){
      breakdown["6-8"]++;
      break;
    }
    else if(age < 12){
      breakdown["9-11"]++;
      break;
    }
    else if(age < 15){
      breakdown["12-14"]++;
      break;
    }
  }
  return breakdown;
}
exports.attendeeTypeBreakdown = function(attendance){
  const breakdown = {
    totalCount: attendance.children.length + attendance.staff.length,
    childrenPercentage: (attendance.children.length / (attendance.children.length + attendance.staff.length)) * 100 ,
    staffPercentage: (attendance.staff.length / (attendance.children.length + attendance.staff.length)) * 100,
  }
  return breakdown;
}

exports.numberOfAttendeesColumnChartData = function(attendances){
  const data = [['Date', 'Number of Children']];
  for(var i = 0; i< attendances.length; i++){
    data.push([attendances[i].dateStamp, attendances[i].children.length]);
  }
  console.log(data);
  return data;
}
