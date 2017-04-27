$(document).ready(function(){
  $(".dtBox").DateTimePicker(
    {
    timepicker:false,
    dateTimeFormat: 'dd-MM-yyyy hh:mm:ss AA'
    });

    // binds form to ajaxForm method
    $('form').each(function(){
         $(this).ajaxForm(function(){
             console.log('yeet');
         });
     });

});

$(document).on('click', '#addChild', function(){
  var legal_guardian_id = $('input[name="legal_guardian_id"]').first().val();
  console.log(legal_guardian_id);
    $('.register_children_form').last().after(
      `<form class="register_children_form" action="/open_gym/register_children" method="post">
      <div class="child">
        <label for="firstname">Firstname</label>
        <input type="text" name="firstname" value="" required>
        <label for="lastname">Lastname</label>
        <input type="text" name="lastname" value="" required>
        <br>
        <input type="hidden" name="legal_guardian_id" value=`+legal_guardian_id+` >
        <label for="address">Address</label>
        <input type="text" name="address" value="">
        <label for="zip_code">Zip Code</label>
        <input type="text" name="zip_code" value="">
        <br>
        <label for="emergency_contact_name">Emergency Contact Name</label>
        <input type="text" name="emergency_contact_name" value="">
        <label for="emergency_contact_phone">Emergency Contact Phone Number</label>
        <input type="text" name="emergency_contact_phone" value="">
        <br>
        <label for="birthday">Birthday</label>
        <input type="text" data-field="date" name="birthday" readonly>
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
    ).ajaxForm(function(){
      console.log('dynamic yeet');
    });
});
$(document).on('click', '#submitRegistrationForms', function(e){
  $('form').each(function(){
       $(this).submit();
   });

 // url = window.location.origin;
 // window.location.href = url;


});
