var API_KEY = process.env.MAILCHIMP_API_KEY;
console.log(API_KEY);
var Mailchimp = require('mailchimp-api-v3');
var mailchimp = new Mailchimp(API_KEY);

module.exports = function(email){
  console.log("hereee");
  mailchimp.request({
    method: 'post',
    path : '/lists/133a89e384/members',
    body: {
      email_address: email,
      status: 'subscribed'
    }
  }, function (err, result) {
    if(err) console.log(err);
    else console.log('Added Email!');
  })
}
