
$(document).on('click', '#addChild', function(){
    $('.register_children_form .child').last().prepend('<div class="child"><label for="firstname">Firstname</label><input type="text"name="firstname" value="" required><label for="lastname">Lastname</label><input type="text" name="lastname" value="" required><input type="hidden" name="legal_guardian_id" value="58e2f67b84cef6713d4d0bdf"></div>');
});
