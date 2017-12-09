var count = 1;
$(document).ready(function(){
  $(".dtBox").DateTimePicker(
    {
    timepicker:false,
    dateTimeFormat: 'dd-MM-yyyy hh:mm:ss AA'
    });
});

$(document).on('click', '#addChild', function(){
  var r = confirm("Are you sure you want to register another child?");
  if(r){
    count++;
    old_count = count-1;
    var legal_guardian_id = $('input[name="legal_guardian_id"]').first().val();
      $('.register_children_form'+old_count).last().after(
        `<form class="register_children_form`+count+`" action="/open_gym/register_children" method="post">
        <div class="child" style="border-top: 1px solid #1f3052">
          <a href="#" id="close">X</a>
          <label for="firstname">Firstname</label>
          <input type="text" name="firstname" value="" required>
          <label for="lastname">Lastname</label>
          <input type="text" name="lastname" value="" required>
          <br>
          <input type="hidden" name="legal_guardian_id" value=`+legal_guardian_id+` >
          <label for="address">Address</label>
          <input type="text" name="address" value="">
          <input type="text" name="city" value="" required="">
          <br>
          <label for="zip_code">Zip Code</label>
          <input type="text" name="zip_code" value="">
          <br>
          <label for="emergency_contact_name">Emergency Contact Name</label>
          <input type="text" name="emergency_contact_name" value=""><br>
          <label for="emergency_contact_phone">Emergency Contact Phone Number</label>
          <input type="text" name="emergency_contact_phone" value="">
          <br>
          <label for="birthday">Birthday</label>
          <input type="text" data-field="date" name="birthday" readonly>
          <br>
          <label for="medical_notes">Medical Notes:</label>
          <br>
          <textarea name="medical_notes" rows="8" cols="50"></textarea>
          <br>
          <label for="permission_to_walk">Permission To Walk</label>
          <input type="radio" name="permission_to_walk" value="yes">Yes
          <input type="radio" name="permission_to_walk" value="no">No
          <br>
          <label for="media_agreement">Media Agreement</label>
          <input type="radio" name="media_agreement" value="yes">Yes
          <input type="radio" name="media_agreement" value="no">No
        </div>
        </form>`
      );
  }

});
$(document).on('click', '#submitRegistrationForms', function(e){
var dataString = $('form').serialize();

  $.ajax({
    method: 'POST',
    url: 'register_children',
    data: dataString,
    success: function(data){
      window.location= "http://"+window.location.host
    }
  });
});

$(document).on('keyup','#search_bar', function(e){
  $.ajax({
    url: "find_user",
    method: "POST",
    data: {
      name: $('#search_bar').val()
    },
    success: function(data){
      // console.log(data.length);
      // console.log(data.children.length);
      var date = $('#current_date').val();
      $('#children_container').empty();
      for(var i = 0; i< data.children.length; i++){
        console.log(data.children[i].firstname);
        $('#children_container').append(`<div class="child_container"><h3 class="child_name">`+data.children[i].firstname+ ` `+ data.children[i].lastname+`</h3> <a href="/open_gym/weekly_attendance/signin/`+date+`?child_id=`+data.children[i]._id+`" class="sign_in_button">Sign In</a></div>`
      );

      }
    }
  })
});
$(document).on('click',"#close",function(e){
  $(this).parent().remove();
});
