var fs = require('fs');

module.exports = {
get_profile_picture_file:  function(id) {
    if (fs.existsSync('public/user_images/'+id+'/profile_pic.png')) {
        return 'public/user_images/'+id+'/profile_pic.png';
    }
    else return 'public/images/user-placeholder.jpg'
  }

}
