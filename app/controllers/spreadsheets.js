var mongoose = require( 'mongoose' ),
    Child = mongoose.model('Child', 'childSchema'),
    User = mongoose.model('User', 'userSchema'),
    Attendance = mongoose.model('Attendance', 'attendanceSchema');
var Excel = require('exceljs');


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
setTimeout( function(){ done(workbook) }, 3000 );
}

exports.create = function(req, res){
  writeRows(function(workbook){
    console.log('DONE');
    d = new Date().toDateString().split(' ').join('_');
   filename = '../public/spreadsheets/registration'+d+'.xlsx';
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
    ];
    Attendance.findOne({date: req.params.date}, function(err, attendance){
      if(err)console.log(err);
      else{
        Child.find({_id: {$in: attendance.children_present} }, function(err, children){
          if(err) console.log(err);
          else{
            for(var i = 0;i<children.length;i++){
              sheet.addRow({
                firstname: children[i].firstname,
                lastname: children[i].lastname,
              });
            }
          }
        })
      }
    }); //attendance
    setTimeout(function(){
      filename = './public/spreadsheets/weekly/'+req.params.date+'.xlsx';
       workbook.xlsx.writeFile(filename)
         .then(function() {
           console.log("wrote to a file");
           res.download(filename); // works like expected
         })
         .catch(function(err){
           console.log(err);
         });
    }, 1000);
}
