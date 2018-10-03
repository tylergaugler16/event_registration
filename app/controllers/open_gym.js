var mongoose = require( 'mongoose' ),
    Child = mongoose.model('Child', 'childSchema'),
    User = mongoose.model('User', 'userSchema'),
    Attendance = mongoose.model('Attendance', 'attendanceSchema');


exports.info = function(req, res){
  res.render('./open_gym/info');
}

exports.register = function(req, res){
  // console.log(req.user);
  console.log(req.query.parent_id);
  if(req.user.status == 'parent'){
    res.render('./open_gym/register', {role: 'parent', legal_guardian_id: req.user._id});
  }
  else if(req.user.status == 'admin'){
    if(req.query.parent_id){
      res.render('./open_gym/register', {role: 'parent', legal_guardian_id: req.query.parent_id});
    }
    else{
      res.render('./open_gym/register', {role: 'parent', legal_guardian_id: req.user._id});
    }

  }
  else res.send('not working');
}

exports.register_children = function(req,res){
  var successfully_added_kids= [];
  if(req.body.firstname instanceof Array){
    for(var i = 0;i < req.body.firstname.length;i++){


      if(req.body.birthday){
        var d = req.body.birthday[i].split('-');
        var birthday = new Date(d[2] + "-"+ d[1]+"-"+ d[0]+" EST").toISOString();
      }
      else{
        var birthday = null;
      }

      var child = new Child({
        firstname: req.body.firstname[i],
        lastname: req.body.lastname[i],
        legal_guardian_id: req.body.legal_guardian_id[i],
        address: req.body.address[i],
        city: req.body.city[i],
        zip_code: req.body.zip_code[i],
        emergency_contact_name: req.body.emergency_contact_name[i],
        emergency_contact_phone: req.body.emergency_contact_phone[i],
        birthday: birthday,
        registered_for_og: true,
        permission_to_walk: (req.body.permission_to_walk[i] == 'yes')? true : false,
        media_agreement: (req.body.media_agreement[i] == 'yes')? true : false,
        archived: false
      });
      child.save(function(err,resp){
        if(err) {
          console.log("error from open_gym#register_children(multiple children register)",err);
          req.flash('error_message', 'Unable to register child!!!');
          res.sendStatus(400);
        }
        else{

          successfully_added_kids.push(child.fullname);
          User.update({_id: req.body.legal_guardian_id},{$addToSet: {children: child}}, function(err, user){
                if(err) console.log(err);
                else console.log(user);
              });
        }
      });

      if(i === req.body.firstname.length -1){
        req.flash('success_message', 'Successfully registered');
        res.sendStatus(200);
      }
    }//for

  }
  else{

    if(req.body.birthday){
      var d = req.body.birthday.split('-');
      var birthday = new Date(d[2] + "-"+ d[1]+"-"+ d[0]+" EST").toISOString();
    }
    else{
      var birthday = null;
    }

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
      birthday: birthday,
      registered_for_og: true,
      permission_to_walk: (req.body.permission_to_walk == 'yes')? true : false,
      media_agreement: (req.body.media_agreement == 'yes')? true : false,
      archived: false
    });
    child.save(function(err){
      if(err){
        console.log("error from open_gym#register_children(single child register)",err);
        res.sendStatus(400);
      }
      else{
        console.log('child registered');
        successfully_added_kids.push(child.fullname);
        User.update({_id: req.body.legal_guardian_id},{$addToSet: {children: child}}, function(err, user){
              if(err) console.log(err);
              else {
                req.flash('success_message', 'Successfully registered');
                res.sendStatus(200);
              }
            });
      }
    });

  }
  // console.log(successfully_added_kids[0]);
  // if(successfully_added_kids.length > 0){
  //   req.flash('success_message', 'Successfully registered'+ successfully_added_kids.join(", "));
  //   res.redirect('/users/'+req.user._id);
  // }

}

exports.registered_index = function(req, res){

  const sortByHash = {
    lastnameAsc: { lastname: -1},
    lastnameDesc: {lastname: 1},
    firstnameAsc: {firstname: -1},
    firstnameDesc: {firstname: 1},
    createdAtAsc: {created_at: -1},
    createdAtDesc: {created_at: 1},
  }
  const searchValue = req.params.keywords? req.params.keywords : "";
  const sortBy = req.params.sortBy? req.params.sortBy : 'lastnameAsc';


  const queryConditions = {fullname: new RegExp( searchValue , "i") };
  if(req.query.archived){
    queryConditions.archived = req.query.archived;
  }
  if(req.query.medical_notes){
    queryConditions.medical_notes = req.query.medical_notes ==="true"? { $ne: "none" } : "none";
  }
  if(req.query.signed_up_after){
    const number_of_days = (parseInt(req.query.signed_up_after, 10) || 0)  * 86400000;
    const ms = new Date().getTime() - number_of_days;
    const selectedDate = new Date(ms);
    queryConditions.created_at = { $gte: selectedDate }
  }
  if(req.query.archived){
    queryConditions.archived = req.query.archived;
  }
  console.log(queryConditions);

  Child.find( queryConditions , function(err, children){
    if(err) console.log(err);
    else{
      var legal_guardian_ids = children.map(function(a) {return a.legal_guardian_id[0];});
      var parent_hash = {};

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
  }).sort( sortByHash[sortBy.toString()] || {lastname: 1});
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


  if(req.body.birthday){
    var d = req.body.birthday.split('-');
    var birthday = new Date(d[2] + "-"+ d[1]+"-"+ d[0]+" EST").toISOString();
  }
  else{
    var birthday = null;
  }

  var new_data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    address: req.body.address,
    city: req.body.city,
    zip_code: req.body.zip_code,
    birthday: birthday,
    emergency_contact_name: req.body.emergency_contact_name,
    emergency_contact_phone: req.body.emergency_contact_phone,
    medical_notes: req.body.medical_notes,
    permission_to_walk: (req.body.permission_to_walk.toString() == 'yes')? true : false,
    media_agreement: (req.body.media_agreement == 'yes')? true : false,
    archived: req.body.archived
  }
  Child.findOneAndUpdate({_id: req.body.id}, {$set: new_data}, function(err, child){
    if(err){
        console.log("error in open_gym#update_child");
      req.flash('error_message', 'Error updating child: '+child.fullname);
      res.redirect('/users/'+child.get_gaurdian().toString());

    }
    else{

      req.flash('success_message', 'Successfully updated child: '+child.fullname);
      res.redirect('/users/'+child.get_gaurdian().toString());

    }
  });
}


exports.new_weekly_attendance = function(req, res){
  res.render('./open_gym/new_weekly_attendance');
}
exports.create_weekly_attendance = function(req, res){
  var date = req.body.month+"-"+req.body.day+"-"+req.body.year;
  var attendance = new Attendance({dateStamp: date, date: date});
  attendance.save(function(err){
    if(err) console.log(err);
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
    if(err)console.log(err);
    else{
      Attendance.getSortedMemberArray(attendance).then(function(sortedArray){
        console.log(sortedArray);
        res.render('./open_gym/weekly_attendance_view',{children: sortedArray, attendance: attendance});
      }).catch(function(err){
        console.log(err);
      })
    }

  });

}
exports.find_user = function(req, res){
  Child.find( {fullname: new RegExp('^' + req.body.name, "i"), archived: false },{firstname: 1, lastname: 1, address: 1, fullname: 1}, function(err, children){
    User.find({fullname: new RegExp('^' + req.body.name, "i"), status: 'staff' }, {firstname: 1, lastname: 1, address: 1, status: 1, fullname: 1}, function(err, staff){
      if(err) console.log("error in open_gym#find_user");
      else{
        console.log(staff);
        const sortedArray = children.concat(staff).sort(compare)
        res.send({children: sortedArray});
      }
    });

  });
}

function compare(a,b) {
  if (a.fullname < b.fullname)
    return -1;
  if (a.fullname > b.fullname)
    return 1;
  return 0;
}

exports.signin = function(req, res){
  var time = new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"});
  Attendance.findOne({date: req.params.date }, function(err, attendance){
    if(err) console.log(err);
    else{
      const childIds = attendance.children.map(x => x.child_id.toString());
      const staffIds = attendance.staff.map(x => x.staff_id.toString());
      if(childIds.includes(req.query.person_id.toString()) ||    staffIds.includes(req.query.person_id.toString()) ){
        console.log("ALREADY SIGNED IN!!");
      }
      else{
        if(req.query.is_staff === "true"){
          Attendance.update({date: req.params.date }, { $addToSet: {staff: {staff_id: req.query.person_id, sign_in_time: time, signed_out: false} }},{upsert: true}, function(err, attendance){
                if(err) {
                  console.log("Error in open_gym#signin for adding staff");
                }
            });
        }
        else{
          Attendance.update({date: req.params.date }, { $addToSet: {children: {child_id: req.query.person_id, sign_in_time: time, signed_out: false} }},{upsert: true}, function(err, attendance){
            if(err) {
              console.log("Error in open_gym#signin for adding child")
            }
            });
        }
      }
    }
  });

  res.redirect('/open_gym/weekly_attendance/'+req.params.date);
}

exports.signout = function(req, res){
  var time = new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"});
    Attendance.findOne({ date: req.params.date} , function(err, attendance){
      if(req.body.is_staff){
        for (var i=0; i < attendance.staff.length; i++) {
         if (attendance.staff[i].staff_id.toString() === req.body.person_id) {
             attendance.staff[i].signed_out = true;
             attendance.staff[i].signed_out_time = time;
             // console.log(attendance);
             attendance.save(function(err, resp){
               if(err) res.json({ status : 400 });
               else res.json({ status : 200, signed_out_time: time});
             });
         }
       }
      }{
        for (var i=0; i < attendance.children.length; i++) {
         if (attendance.children[i].child_id.toString() === req.body.person_id) {
             attendance.children[i].signed_out = true;
             attendance.children[i].signed_out_time = time;
             attendance.save(function(err, resp){
               if(err) res.json({ status : 400 });
               else res.json({ status : 200, signed_out_time: time});
             });
         }
       }
      }
  });

  //   console.log("yerr");
  //   Attendance.findOneAndUpdate({
  //   query: { date: req.params.date , children: { $elemMatch: { child_id: req.params.child_id } } },
  //   update: { $set: { "children.$.signed_out_time": true, "children.$.signed_out_time" : time } }
  //   }, function(err){
  //     console.log("here");
  //   if(err) console.log(err);
  //   else res.json({ status : 200, signed_out_time: time});
  // });
  //   Attendance.findOne( { date: req.params.date , children: { $elemMatch: { child_id: req.params.child_id } } }
  // , function(err, attendance){
  //     console.log(attendance);
  //   if(err) console.log(err);
  //   else
  // });
}

exports.delete_attendance = function(req, res){
  console.log(req.params.id);
  Attendance.deleteOne({_id: req.params.id}, function(err, results){
    if (err) res.redirect('/');
    else res.redirect('/admin/weekly_attendance');
  });

}
exports.weekly_attendance_for_admin = function(req, res){
  Attendance.find(function(err, attendance) {
    if(err) console.log(err);

    else{
      for(var i =0;i< attendance.length; i++){
        console.log(attendance[i].dateStamp);
      }
      res.render('./admin/weekly_attendance',{attendance: attendance});
    }
  }).sort({dateStamp: -1}) ;
}
