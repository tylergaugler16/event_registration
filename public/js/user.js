

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
  const profile_picture = queryHash["profile_picture"];
  const archived = queryHash["archived"];
  const status = queryHash["status"];

  if(signed_up_after){
    $("input[name=signed_up_after][value="+signed_up_after+"]").prop("checked",true);
  }
  if(profile_picture){
    $("input[name=profile_picture][value="+profile_picture+"]").prop("checked",true);
  }
  if(archived){
    $("input[name=archived][value="+archived+"]").prop("checked",true);
  }
  if(status){
    const values = status.split(',');
    console.log(values);
    for(let i = 0; i< values.length; i++){
      console.log("input[name=status][value="+values[i]+"]")
      $("input[name=status][value="+values[i]+"]").prop("checked",true);
    }
  }


});


$(document).on('change', '#sort-users', function(e){
  const sortBy = $(this).val() || "lastnameAsc";
  const searchValue = $('#search-users').val() ? "/search/" + $('#search-users').val() :  "/";
  window.location= "http://"+window.location.host+"/users/sort/"+sortBy+ searchValue+getFilterQueryParemeters();
});

$(document).on('click', '.search-users-button', function(e){
  console.log("here");
  const searchValue = $('#search-users').val() ? "/search/" + $('#search-users').val() :  "/";
  const sortValue= ($('#sort-users').val()|| "lastnameAsc");
  window.location= "http://"+window.location.host+"/users/sort/"+sortValue+searchValue+getFilterQueryParemeters();
});


const getFilterQueryParemeters = function(){
  const values = [];

  const signed_up_after = $('input[name=signed_up_after]:checked').val();
  if(signed_up_after){
    values.push("signed_up_after="+signed_up_after);
  }

  const profile_picture = $('input[name=profile_picture]:checked').val();
  if(profile_picture){
    values.push("profile_picture="+profile_picture);
  }

  const archived = $('input[name=archived]:checked').val();
  if(archived){
    values.push("archived="+archived);
  }

  const status = $("input[name=status]:checked").map(function() {
      return this.value;
    }).get().join(",") ;
  if(status){
    values.push("status="+status);
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
    window.location= "http://"+window.location.host+"/users";
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
