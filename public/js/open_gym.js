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
          <label for="firstname">Firstname*</label>
          <input type="text" name="firstname" value="" required>
          <label for="lastname">Lastname*</label>
          <input type="text" name="lastname" value="" required>
          <br>
          <input type="hidden" name="legal_guardian_id" value=`+legal_guardian_id+` >
          <label for="address">Address*</label>
          <input type="text" name="address" required value=`+address+` >
          <label for="city">City*</label>
          <input type="text" name="city" required value=`+city+` >
          <br>
          <label for="zip_code">Zip Code*</label>
          <input type="text" name="zip_code" required value=`+zip_code+` >
          <br>
          <label for="emergency_contact_name">Emergency Contact Name*</label>
          <input type="text" name="emergency_contact_name" required value=`+emergency_contact_name+` ><br>
          <label for="emergency_contact_phone">Emergency Contact Phone Number*</label>
          <input type="text" name="emergency_contact_phone" required value=`+emergency_contact_phone+` >
          <br>
          <label for="birthday">Birthday*</label>
          <input type="text" data-field="date" name="birthday" readonly required>
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
  let formHasErrors = false;
  $('input,textarea,select').filter('[required]:visible').each(function(){
    if($(this).val()){
      $(this).removeClass('has-errors');
    }
    else{
      $(this).addClass('has-errors');
      formHasErrors = true;
    }
  });

  if(formHasErrors){
    e.preventDefault();
    alert("Please fill out the requred fields");
    return;
  }
  var dataString = $('form').serialize();

  $.ajax({
    method: 'POST',
    url: 'register_children',
    data: dataString,
    success: function(data){
      window.location= "http://"+window.location.host
    },
    error: function(data){
      alert("There was an error submitting the form. Please check that you have filled out everything appropriately");
    },
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
        const isStaff= (data && data.children && data.children[i] &&  data.children[i].status && data.children[i].status === "staff")? "true" : "false";
        console.log(isStaff);
        console.log(data);
        const person_id = data.children[i]._id;
        // console.log(data.children)
        $('#children_container').append(`<div class="child_container `+ (isStaff === "true"? "staff-member" : "" )+`"><h3 class="child_name">`+data.children[i].firstname+ ` `+ data.children[i].lastname+`</h3> <a href="/open_gym/weekly_attendance/signin/`+date+`?person_id=`+person_id+`&is_staff=` +isStaff+`" class="sign_in_button">Sign In</a></div>`
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

  const queryHash = getUrlVars();
  //
  const signed_up_after = queryHash["signed_up_after"];
  const medical_notes = queryHash["medical_notes"];
  const archived = queryHash["archived"];

  if(signed_up_after){
    $("input[name=signed_up_after][value="+signed_up_after+"]").prop("checked",true);
  }
  if(medical_notes){
    $("input[name=medical_notes][value="+medical_notes+"]").prop("checked",true);
  }
  if(archived){
    $("input[name=archived][value="+archived+"]").prop("checked",true);
  }

});


$(document).on('change', '#sort-users', function(e){
  const sortBy = $(this).val() || "lastnameAsc";
  const searchValue = $('#search-users').val() ? "/search/" + $('#search-users').val() :  "/";
  console.log(sortBy);
  console.log(this.val);
  window.location= "http://"+window.location.host+"/open_gym/registered/children/sort/"+sortBy+ searchValue+getFilterQueryParemeters();
});

$(document).on('click', '.search-users-button', function(e){
  console.log("here");
  const searchValue = $('#search-users').val() ? "/search/" + $('#search-users').val() :  "/";
  const sortValue= ($('#sort-users').val()|| "lastnameAsc");
  window.location= "http://"+window.location.host+"/open_gym/registered/children/sort/"+sortValue+searchValue+getFilterQueryParemeters();
});

const getFilterQueryParemeters = function(){
  const values = [];

  const signed_up_after = $('input[name=signed_up_after]:checked').val();
  if(signed_up_after){
    values.push("signed_up_after="+signed_up_after);
  }

  const medical_notes = $('input[name=medical_notes]:checked').val();
  if(medical_notes){
    values.push("medical_notes="+medical_notes);
  }

  const archived = $('input[name=archived]:checked').val();
  if(archived){
    values.push("archived="+archived);
  }

  if(values.length > 0){
    return "?"+values.join("&");
  }
  else{
    return "";
  }
}
$(document).on('click', '.show-filters-button', function(e){
  $('.all-filter-options-container').slideToggle(300);
})


$(document).on('click', '#clear-filters', function(e){
  $('input[type=radio]').prop('checked',false);
  $('input[type=checkbox]').prop('checked',false);
    window.location= "http://"+window.location.host+"/open_gym/registered/children";
})


const getUrlVars = function()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

// $(document).on('change', '')
