var mongoose = require('mongoose');
const Child = mongoose.model('Child', 'childSchema');
const User = mongoose.model('User', 'userSchema');
// grab the things we need
var Schema = mongoose.Schema;

// create a schema
var attendanceSchema = new Schema({
  date: { type: String, unique: true }, // needto change this to actual date to sort
  dateStamp: {type: Date, require: true, unique: true},
  children: [{
    child_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Child'}, // do not make this unique!
    sign_in_time: { type: String, required: true },
    signed_out: {type: Boolean, default: false },
    signed_out_time: { type: String }
  }],
  staff: [{
    staff_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // do not make this unique!
    sign_in_time: { type: String, required: true },
    signed_out: {type: Boolean, default: false },
    signed_out_time: { type: String }
  }]
});



// eventSchema.methods.in_the_past = function(){
//   return (new Date(this.date) < new Date());
// }
// eventSchema.methods.formatDate = function(){
//   return this.date.toDateString() + " " + this.date.toLocaleTimeString();
// }

attendanceSchema.statics.getSortedMemberArray = function(attendance){
  return new Promise(function(resolve, reject) {
    var member_array = [];
    if(!attendance.children) attendance.children = [];
    if(!attendance.staff) attendance.staff = [];
    const childrenArrayLength = attendance.children? attendance.children.length : 0;
    for(var i = 0 ; i < childrenArrayLength; i++){
      member_array.push( {
        id: attendance.children[i].child_id,
        parent_id: null,
        sign_in_time: attendance.children[i].sign_in_time,
        signed_out: attendance.children[i].signed_out,
        signed_out_time: attendance.children[i].signed_out_time,
        fullname: null,
        isStaff: false,
      });
    }
    const staffArrayLength = attendance.staff? attendance.staff.length : 0;
    for(var i = 0 ; i < staffArrayLength; i++){
      member_array.push( {
        id: attendance.staff[i].staff_id,
        parent_id: null,
        sign_in_time: attendance.staff[i].sign_in_time,
        signed_out: attendance.staff[i].signed_out,
        signed_out_time: attendance.staff[i].signed_out_time,
        fullname: null,
        isStaff: true,
      });
    }
    console.log(attendance);
    console.log(attendance.children.map(x => x.child_id.toString() ));
    Child.find({_id: {$in: attendance.children.map(x => x.child_id.toString() ) } }, function(err, children){
      if(err) reject(err);
      else{

        User.find( { $and: [
                        {_id: { $in: attendance.staff.map(x => x.staff_id.toString() ) } },
                        { status: 'staff' } ] }, function(err, users){
            if(err) reject(err);
            else{

              for(var i = 0; i < children.length; i++){
                for(var n = 0; n < member_array.length; n++){
                  if(children[i]._id.toString() == member_array[n].id.toString()){
                    console.log(children[i].firstname);
                    member_array[n].fullname = children[i].fullname;
                    member_array[n].parent_id = children[i].get_gaurdian();
                    break;
                  }
                }
              }
              for(var i = 0; i < users.length; i++){
                for(var n = 0; n < member_array.length; n++){
                  if(users[i]._id.toString() == member_array[n].id.toString()){
                    if(member_array[n].isStaff){
                      member_array[n].fullname = users[i].fullname;
                      break;
                    }
                  }
                }
              }
              const sortedMemberArray = member_array.sort(compare);
              resolve(sortedMemberArray);
            }

        }); // user.find
      }
    });
  });
}

const compare = function(a,b) {
  if (a.fullname < b.fullname)
    return -1;
  if (a.fullname > b.fullname)
    return 1;
  return 0;
}


// Attendance.statics.getAttendanceForUser = function(user_id, is_user){
//   getAttendanceStatisticsOnUser(user_id, is_user).then(function(sheets){
//     console.log(sheets);
//   });
// }
//
//
// const getAttendanceStatisticsOnUser = function(user_id, is_user){
//   return Attendance.find({})
//
// }
//
// const getUserForAttendance = function(user_id, is_user){
//   if(is_user){
//     return User.findOne({_id: user_id});
//   }
//   else{
//     return Child.findOne({_id: user_id});
//   }
// }

attendanceSchema.statics.getAttendance = function(date){
  return this.find({date: date});
}


// the schema is useless so far
// we need to create a model using it
var Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
