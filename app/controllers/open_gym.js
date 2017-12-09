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
  else if(req.user.status == 'admin'){
    res.render('./open_gym/register', {role: 'parent'});
  }
  else res.send('not working');
}

exports.register_children = function(req,res){
  console.log(req.body.firstname);
  console.log(req.body.firstname.length);
  var successfully_added_kids= [];
  if(req.body.firstname instanceof Array){
    console.log("heree");
    for(var i = 0;i < req.body.firstname.length;i++){
      var d = req.body.birthday[i].split('-');
      var child = new Child({
        firstname: req.body.firstname[i],
        lastname: req.body.lastname[i],
        legal_guardian_id: req.body.legal_guardian_id[i],
        address: req.body.address[i],
        city: req.body.city[i],
        zip_code: req.body.zip_code[i],
        emergency_contact_name: req.body.emergency_contact_name[i],
        emergency_contact_phone: req.body.emergency_contact_phone[i],
        birthday: Date.UTC(d[2], d[1], d[0]),
        registered_for_og: true,
        permission_to_walk: (req.body.permission_to_walk[i] == 'yes')? true : false,
        media_agreement: (req.body.media_agreement[i] == 'yes')? true : false
      });
      child.save(function(err,resp){
        console.log(err);
        if(err) {
          console.log("ERRORR");
          req.flash('message', 'Unable to register child!!!');
          res.redirect('/')
        }
        else{
          console.log('child registered');
          successfully_added_kids.push(child.fullname);
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
      fullname: req.body.firstname + " "+req.body.lastname,
      legal_guardian_id: req.body.legal_guardian_id,
      address: req.body.address,
      city: req.body.city,
      zip_code: req.body.zip_code,
      emergency_contact_name: req.body.emergency_contact_name,
      emergency_contact_phone: req.body.emergency_contact_phone,
      birthday: Date.UTC(d[2], d[1], d[0]),
      registered_for_og: true,
      permission_to_walk: (req.body.permission_to_walk == 'yes')? true : false,
      media_agreement: (req.body.media_agreement == 'yes')? true : false
    });
    child.save(function(err){
      if(err) console.log(err);
      else{
        console.log('child registered');
        successfully_added_kids.push(child.fullname);

        console.log(child);
        User.update({_id: req.body.legal_guardian_id},{$addToSet: {children: child}}, function(err, user){
              if(err) console.log(err);
              else console.log(user);
            });
      }
    });

    console.log(req.body);
  }
  console.log(successfully_added_kids[0]);
  req.flash('message', 'Successfully registered'+ successfully_added_kids.join(", "));
  res.sendStatus(200);
}

exports.registered_index = function(req, res){


  Child.find(function(err, children){
    if(err) console.log(err);
    else{
      var legal_guardian_ids = children.map(function(a) {return a.legal_guardian_id[0];});
      var parent_hash = {};
      console.log(legal_guardian_ids);
      User.find({_id: {$in: legal_guardian_ids}}, function(err, parents){
        if(err) console.log(err);
        else{
          for(var i=0;i<parents.length;i++){
            parent_hash[parents[i]._id] = parents[i].full_name();
          }
          res.render('./open_gym/registered_index',{children: children, parent_hash: parent_hash});
        }
      });
    }
  });
  // console.log(child_array);
  // res.send(parents);
}
exports.registered_parents_index = function(req, res){
  User.find({status: "parent"}, function(err, parents){
    if(err) console.log(err);
    else{
      res.render('./open_gym/registered_parents_index', {parents: parents});
    }
  })
}

exports.edit_child = function(req, res){
  Child.findOne({ _id: req.params.id }, function(err, child){
    if(err) res.send('could not find child with that id');
    else{
      if( (res.locals.current_user._id.toString() == child.get_gaurdian().toString()) || res.locals.current_user.status == 'admin'){
        res.render('./open_gym/edit_child', {child: child});
      }
      else{
        res.send("You don't have permission to edit this child ");
      }
    }
  });
}
exports.update_child = function(req, res){
  var new_data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    address: req.body.address,
    city: req.body.city,
    zip_code: req.body.zip_code,
    emergency_contact_name: req.body.emergency_contact_name,
    emergency_contact_phone: req.body.emergency_contact_phone,
    medical_notes: req.body.medical_notes,
    permission_to_walk: (req.body.permission_to_walk.toString() == 'yes')? true : false,
    media_agreement: (req.body.media_agreement == 'yes')? true : false
  }
  Child.findOneAndUpdate({_id: req.body.id}, {$set: new_data}, function(err, child){
    if(err){
      console.log("error");
    }
    else{
      console.log(child);
      res.redirect('/users/'+child.get_gaurdian().toString());

    }
  });
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
  Child.find( {fullname: new RegExp('^' + req.body.name, "i") },{firstname: 1, lastname: 1, address: 1}, function(err, children){
    res.send({children: children});
  });
}

exports.signin = function(req, res){
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
