var API_KEY = process.env.MAILCHIMP_API_KEY;
var Mailchimp = require('mailchimp-api-v3');
var mailchimp = new Mailchimp(API_KEY);

module.exports = function(user){
  mailchimp.request({
    method: 'post',
    path : '/lists/133a89e384/members',
    body: {
      email_address: user.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: user.firstname,
        LNAME: user.lastname
      }
    }
  }, function (err, result) {
    if(err) console.log(err);
    else console.log('Added Email!');
  })
}
