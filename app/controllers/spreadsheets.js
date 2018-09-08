var mongoose = require( 'mongoose' ),
    Child = mongoose.model('Child', 'childSchema'),
    User = mongoose.model('User', 'userSchema'),
    Attendance = mongoose.model('Attendance', 'attendanceSchema');
var Excel = require('exceljs');
var nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport( {
  service: 'SendGrid',
  host: "smtp.sendgrid.net",
  port: '587',
  auth: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_PASSWORD
  }
});


// var fs = require('fs');

var writeRows = function(done){
  var workbook = new Excel.Workbook();
  var sheet = workbook.addWorksheet("My Sheet",{
    pageSetup: {showGridLines: true, horizontalCentered: true}
  });
  sheet.properties.outlineLevelCol = 5;
  sheet.properties.defaultRowHeight = 25;
  sheet.properties.tabColor = 'blue'
    sheet.columns = [
        { header: 'First Name', key: 'firstname', width: 10 },
        { header: 'Last Name', key: 'lastname', width: 20 },
        { header: 'Full Name', key: 'full_name', width: 20 },
        { header: 'D.O.B.', key: 'birthday', width: 20, style: { alignment: {horizontal: 'left'} } },
        { header: 'Address', key: 'address', width: 20 },
        { header: 'Parent Name', key: 'parent_name', width: 20 },
        { header: 'Parent Number', key: 'parent_number', width: 20 },
        { header: 'Parent Email', key: 'parent_email', width: 20 },
        { header: 'Parent Address', key: 'parent_address', width: 20 },
        { header: 'Emergency Contact Name', key: 'emergency_contact_name', width: 25 },
        { header: 'Emergency Contact Number', key: 'emergency_contact_phone', width: 25 },
        { header: 'Medical Notes', key: 'medical_notes', width: 35 },
        { header: 'Permission to Walk', key: 'permission_to_walk', width: 10 },
        { header: 'On Waiting List', key: 'on_waiting_list', width: 10 }
    ];

  Child.find(function(err,children){
    children.forEach(function(item, index){
      User.findOne({_id: item.get_gaurdian()}, function(err, parent){
        console.log(item.firstname);
        sheet.addRow({
          firstname: item.firstname,
          lastname: item.lastname,
          full_name: item.fullname,
          birthday: item.birthday,
          address: item.address,
          parent_name: parent.full_name(),
          parent_number: parent.phone_number,
          parent_email: parent.email,
          parent_address: parent.address + " " + parent.zip_code,
          emergency_contact_name: item.emergency_contact_name,
          emergency_contact_phone: item.emergency_contact_phone,
          medical_notes: item.medical_notes,
          permission_to_walk: (item.permission_to_walk)? 'yes' : 'no',
          on_waiting_list: (item.on_waiting_list)? 'yes' : 'no'
        });
      });
    });

  });
setTimeout( function(){ done(workbook) }, 5000 );
}

var writeToFile = function(workbook, filename, cb){
  // filename = './public/spreadsheets/weekly/'+req.params.date+'.xlsx';
   workbook.xlsx.writeFile(filename)
     .then(function() {
       console.log("wrote to file "+filename);
       cb();
     })
     .catch(function(err){
       console.log("could not write to file");
       console.log(err);
     });
}
exports.create = function(req, res){
  writeRows(function(workbook){
    console.log('DONE');
    d = new Date().toDateString().split(' ').join('_');
   filename = './public/spreadsheets/registration'+d+'.xlsx';
  //  var fd = fs.openSync(filename, 'w');
    workbook.xlsx.writeFile(filename)
      .then(function() {
        console.log("wrote to a file");
        res.download(filename); // works like expected
      })
      .catch(function(err){
        console.log(err);
      });
  });
};

exports.index = function(req, res){
  res.render('./admin/spreadsheets/index')
}

exports.download_weekly_attendance = function(req, res){
  Child.find(function(err, children){
    if(!err) console.log(children.length);
  });
  var workbook = new Excel.Workbook();
  var sheet = workbook.addWorksheet("My Sheet",{
    pageSetup: {showGridLines: true, horizontalCentered: true}
  });

  sheet.properties.outlineLevelCol = 5;
  sheet.properties.defaultRowHeight = 25;
  sheet.properties.tabColor = 'blue'
    sheet.columns = [
        { header: 'First Name', key: 'firstname', width: 10 },
        { header: 'Last Name', key: 'lastname', width: 20 },
        { header: 'Sign In Time', key: 'sign_in_time', width: 20 },
        { header: 'Sign Out Time', key: 'signed_out_time', width: 20 },
    ];
    Attendance.findOne({date: req.params.date}, function(err, attendance){
      if(err)console.log(err);
      else{
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


        // const children_array = children_array.map(x => x.id);

        Child.find({ _id: {$in: children_array.map(x => x.id) } }, function(err, children){
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
  
            for(var i = 0;i<children.length;i++){

              sheet.addRow({
                firstname: children[i].firstname,
                lastname: children[i].lastname,
                sign_in_time: children[i].sign_in_time || "",
                signed_out_time: children[i].sign_in_time || "5:00pm",
              });
              if(i === children.length - 1){
                const filename = './public/spreadsheets/'+req.params.date+'.xlsx';
                writeToFile(workbook, filename, function(){
                  res.download(filename);
                });
              }
            }

          }
        })
      }
    }); //attendance


    //
    //  workbook.xlsx.writeFile(filename)
    //    .then(function() {
    //      console.log("wrote to a file");
    //      if(fs.existsSync(path)) {
    //          res.download(filename); // works like expected
    //     }
    //
    //    })
    //    .catch(function(err){
    //      console.log(err);
    //    });
    setTimeout(function(){

    }, 1000);
}


exports.download_all_weekly_attendance = function(req, res){
  writeToFileAndEmailAllWeeklyAttendance();
  res.send("trying to download email");
}



var writeToFileAndEmailAllWeeklyAttendance  = function(){
  console.log("yooyoy");
  var workbook = new Excel.Workbook();
  var sheet = workbook.addWorksheet("My Sheet",{
    pageSetup: {showGridLines: true, horizontalCentered: true}
  });

  Child.find( {}, function(err, children){
    if(err) console.log(err);
    else{
      childrenHash = {};
      for(var i = 0; i < children.length; i++){
        childrenHash[children[i]._id] = {
          first_name: children[i].firstname,
          last_name: children[i].lastname,
          full_name: children[i].full_name(),
        }
      }
      Attendance.find({}, function(err, attendance_array){
        if(err) console.log(err);
        else{

          var columns = [{header: "", key: "child_name", width: 20}];
          // childrenWhoAttended = attendance_array.map(x => x.child_id);
          for(var i = 0; i< attendance_array.length; i++){
            columns.push({header: attendance_array[i].date, key: 'attendance' + i, width: 20})
          }
          sheet.columns = columns;
          for(var row = 0; row < children.length; row++){
            const id= children[row]._id.toString() ;
            const newRow = { child_name: children[row].firstname};
            for(var col = 0; col < attendance_array.length; col++){
              const childrenWhoAttended = attendance_array[col].children.map(x => x.child_id.toString());
              // console.log(childrenWhoAttended);
              // console.log(id);
              if(childrenWhoAttended.indexOf(id) > -1){
                console.log("heerree");
                newRow["attendance"+col] = "X"
              }

              else{
                newRow["attendance"+col] = ""
              }

            }

            sheet.addRow(newRow);
            if(row === children.length -1){
              const path = './public/spreadsheets/all.xlsx';
              writeToFile(workbook, path, function(){
                // res.download(path);
                send_spreasheet_via_email('tylergaugler16@gmail.com', "downloadAllWeeklyAttendanceSheets.xlsx",path,)
              });
            }
          }

        }
      });

    }
  });
}

function send_spreasheet_via_email(email,filename, path){
  // res.locals.current_user
  var mailOptions = {
    to: email,
    from: 'Maspeth Bible Church <support@maspethbiblechurch.com>',
    subject: 'Download of '+filename,
    text: "",
    attachments: [
      {
        filename: filename,
      path: path
    }
    ]
  };
  smtpTransport.sendMail(mailOptions, function(err, info) {
    if(err)console.log(err);
    done(err, 'done');
  });
}
