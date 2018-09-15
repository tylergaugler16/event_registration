

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
  window.location= "http://"+window.location.host+"/users/sort/"+sortBy+ searchValue;
});

$(document).on('click', '.search-users-button', function(e){
  console.log("here");
  const searchValue = $('#search-users').val() ? "/search/" + $('#search-users').val() :  "/";
  const sortValue= ($('#sort-users').val()|| "lastnameAsc");
  window.location= "http://"+window.location.host+"/users/sort/"+sortValue+searchValue;
});
