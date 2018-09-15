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

    var address = $(".register_children_form1").find($('input[name="address"]')).val();
    var city = $(".register_children_form1").find($('input[name="city"]')).val();
    var zip_code = $(".register_children_form1").find($('input[name="zip_code"]')).val();
    var emergency_contact_name = $(".register_children_form1").find($('input[name="emergency_contact_name"]')).val();
    var emergency_contact_phone = $(".register_children_form1").find($('input[name="emergency_contact_phone"]')).val();

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
          <input type="text" name="address" value=`+address+`>
          <label for="city">City</label>
          <input type="text" name="city" value=`+city+` required="">
          <br>
          <label for="zip_code">Zip Code</label>
          <input type="text" name="zip_code" value=`+zip_code+` required>
          <br>
          <label for="emergency_contact_name">Emergency Contact Name</label>
          <input type="text" name="emergency_contact_name" value=`+emergency_contact_name+`><br>
          <label for="emergency_contact_phone">Emergency Contact Phone Number</label>
          <input type="text" name="emergency_contact_phone" value=`+emergency_contact_phone+`>
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
      var address = $('input[name="address"]');
    $(".register_children_form"+old_count).find(address).val();

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


// for registered index page


$(document).ready(function(){
  const sortRegex = /sort\/([a-zA-Z]+)\//
  const matches = sortRegex.exec(window.location.pathname);
  const searchRegex = /search\/([a-zA-Z0-9%]+)/;
  const searchMatches = searchRegex.exec(window.location.pathname);
  if(matches && matches[1]){
    $('#sort-users').val(matches[1]);
  }
  else{
    $('#sort-users').val('lastnameDesc');
  }
  if(searchMatches && searchMatches[1]){
    const searchValue =  searchMatches[1].replace(/%20/, " ");
    console.log(searchMatches[1]);
    $('#search-users').val(searchValue)
  }
  else{
    $('#search-users').val('')
  }

});


$(document).on('change', '#sort-users', function(e){
  const sortBy = $(this).val() || "lastnameAsc";
  const searchValue = $('#search-users').val() ? "/search/" + $('#search-users').val() :  "/";
  console.log(this.val);
  window.location= "http://"+window.location.host+"/open_gym/registered/children/sort/"+sortBy+ searchValue;
});

$(document).on('click', '.search-users-button', function(e){
  console.log("here");
  const searchValue = $('#search-users').val() ? "/search/" + $('#search-users').val() :  "/";
  const sortValue= ($('#sort-users').val()|| "lastnameAsc");
  window.location= "http://"+window.location.host+"/open_gym/registered/children/sort/"+sortValue+searchValue;
});
