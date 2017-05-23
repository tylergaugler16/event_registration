var mongoose = require( 'mongoose' ),
    Child = mongoose.model('Child', 'childSchema'),
    User = mongoose.model('User', 'userSchema'),
    Attendance = mongoose.model('Attendance', 'attendanceSchema');

exports.info = function(req, res){
  res.render('./open_gym/info');
}

exports.register = function(req, res){
  // console.log(req.user);
  if(req.user.status == 'parent'){
    res.render('./open_gym/register', {role: 'parent'});
  }
  else res.send('not working');
}

exports.register_children = function(req,res){
  console.log(req.body.firstname);
  console.log(req.body.firstname.length);
  if(req.body.firstname instanceof Array){
    console.log("heree");
    for(var i = 0;i < req.body.firstname.length;i++){
      var d = req.body.birthday[i].split('-');
      var child = new Child({
        firstname: req.body.firstname[i],
        lastname: req.body.lastname[i],
        legal_guardian_id: req.body.legal_guardian_id[i],
        address: req.body.address[i],
        zip_code: req.body.zip_code[i],
        emergency_contact_name: req.body.emergency_contact_name[i],
        emergency_contact_phone: req.body.emergency_contact_phone[i],
        birthday: Date.UTC(d[2], d[1], d[0]),
        permission_to_walk: (req.body.permission_to_walk[i] == 'yes')? true : false,
        media_agreement: (req.body.media_agreement[i] == 'yes')? true : false
      });
      console.log(child);
      child.save(function(err){
        console.log("trying to save");
        if(err) console.log(err);
        else{
          console.log('child registered');
          console.log(child);
          User.update({_id: req.body.legal_guardian_id},{$addToSet: {children: child}}, function(err, user){
                if(err) console.log(err);
                else console.log(user);
              });
        }
      });
      console.log(req.body);
    }//for

  }
  else{
    var d = req.body.birthday.split('-');
    var child = new Child({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      legal_guardian_id: req.body.legal_guardian_id,
      address: req.body.address,
      zip_code: req.body.zip_code,
      emergency_contact_name: req.body.emergency_contact_name,
      emergency_contact_phone: req.body.emergency_contact_phone,
      birthday: Date.UTC(d[2], d[1], d[0]),
      permission_to_walk: (req.body.permission_to_walk == 'yes')? true : false,
      media_agreement: (req.body.media_agreement == 'yes')? true : false
    });
    child.save(function(err){
      if(err) console.log(err);
      else{
        console.log('child registered');
        console.log(child);
        User.update({_id: req.body.legal_guardian_id},{$addToSet: {children: child}}, function(err, user){
              if(err) console.log(err);
              else console.log(user);
            });
      }
    });
    console.log(req.body);
  }
res.sendStatus(200);
}

exports.new_weekly_attendance = function(req, res){
  res.render('./open_gym/new_weekly_attendance');
}
exports.create_weekly_attendance = function(req, res){
  var date = req.body.month+"-"+req.body.day+"-"+req.body.year;
  var attendance = new Attendance({date: date});
  attendance.save(function(err){
    if(err) consle.log(err);
    else console.log(attendance);
    res.redirect('/open_gym/weekly_attendance/'+date);
  });
}

exports.weekly_attendance = function(req,res){
  console.log(req.params.date);
  res.locals.date = req.params.date;
  res.render('./open_gym/weekly_attendance');
}
exports.weekly_attendance_view = function(req,res){
  Attendance.findOne({date: req.params.date}, function(err, attendance){
    if(err) console.log(err);
    else{
      Child.find({_id: {$in: attendance.children_present} }, function(err, children){
        if(err) console.log(err);
        else res.render('./open_gym/weekly_attendance_view',{children: children});
      });
    }
  });

}
exports.find_user = function(req, res){
  console.log("yeet");
  Child.find({firstname: new RegExp('^' + req.body.name, "i") },{firstname: 1, lastname: 1, address: 1}, function(err, children){
    if(err)console.log(err);
    else console.log("found the children");
    res.send({children: children});
  });
}

exports.signin = function(req, res){
  console.log("id");
  console.log(req.query.child_id);
  Attendance.update({date: req.params.date},{$addToSet: {children_present: req.query.child_id}}, function(err, attendance){
        if(err) console.log(err);
        else console.log(attendance);
    });
  res.redirect('/open_gym/weekly_attendance/'+req.params.date);
}

exports.weekly_attendance_for_admin = function(req, res){
  Attendance.find(function(err, attendance) {
    if(err) console.log(err);
    else{
      res.render('./admin/weekly_attendance',{attendance: attendance});
    }
  });
}
