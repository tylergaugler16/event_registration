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
  }).sort({lastname: 1});
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
      console.log(attendance);
      var children_array = [];
      var ids = {}
      for(var i = 0 ; i < attendance.children.length; i++){
        id = attendance.children[i].child_id ;
        if( ids[id.toString()] != true){
          children_array.push( {
            id: attendance.children[i].child_id,
            parent_id: null,
            sign_in_time: attendance.children[i].sign_in_time,
            signed_out: attendance.children[i].signed_out,
            signed_out_time: attendance.children[i].signed_out_time,
            fullname: null
          });
          ids[id.toString()] = true;
        }
      }
      Child.find({_id: {$in: children_array.map(x => x.id) } }, function(err, children){
        if(err) console.log(err);
        else{
          for(var i = 0; i < children.length; i++){
            for(var n = 0; n < children_array.length; n++){
              if(children[i]._id.toString() == children_array[n].id.toString()){

                children_array[n].fullname = children[i].fullname;
                children_array[n].parent_id = children[i].get_gaurdian();
                break;
              }
            }
          }
          // alphabatize children array
          children_array.sort( function(a,b) {
                    if (a.fullname < b.fullname)
                      return -1;
                    if (a.fullname > b.fullname)
                      return 1;
                    return 0;
                  });
          res.render('./open_gym/weekly_attendance_view',{children: children_array, attendance: attendance});
        }
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
  var time = new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"});
  console.log(req.query.child_id);
  Attendance.findOne({date: req.params.date }, function(err, attendance){
    if(err) console.log(err);
    else{
      const childIds = attendance.children.map(x => x.child_id.toString());
      if(childIds.includes(req.query.child_id.toString())){
        console.log("ALREADY SIGNED IN!!");
      }
      else{
        Attendance.update({date: req.params.date }, { $addToSet: {children: {child_id: req.query.child_id, sign_in_time: time, signed_out: false} }},{upsert: true}, function(err, attendance){
              if(err) console.log(err);
              else console.log(attendance);
          });
      }
    }
  });

  res.redirect('/open_gym/weekly_attendance/'+req.params.date);
}

exports.signout = function(req, res){
  var time = new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"});
    Attendance.findOne({ date: req.params.date} , function(err, attendance){
      for (var i=0; i < attendance.children.length; i++) {
       if (attendance.children[i].child_id.toString() === req.body.child_id) {
           attendance.children[i].signed_out = true;
           attendance.children[i].signed_out_time = time;
           // console.log(attendance);
           attendance.save(function(err, resp){
             if(err) res.json({ status : 400 });
             else res.json({ status : 200, signed_out_time: time});
           });
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
      res.render('./admin/weekly_attendance',{attendance: attendance});
    }
  });
}
