const express = require('express');
const app = express();
const db = require('./app/models/db');
const routes = require('./app/routes/routes.js');
const bodyParser = require('body-parser');
const session = require('client-sessions');
const env = process.env.NODE_ENV || 'dev';

var mongoose = require( 'mongoose' ),
    User = mongoose.model('User', 'userSchema');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', './app/views');
app.use(express.static('public'));
app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',  // random string to encrypt cookie
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: (env == 'dev'),
  secure: true,
  ephemeral: true
}));
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    console.log("we have a session!");

    User.findOne({ _id: '58e6a01dc375513e12332508'}, function(err, user){
        if (!err && (user != null)) {
          console.log(user.firstname);
          req.user = user
          delete req.user.password; // delete the password from the session
          req.session.user = user  //refresh the session value
          res.locals.user = user // local allws user to be accessed in view
      }
      else{
        res.locals.user = null;
      }
    });
    next();
  } else {
    next();
  }
});


app.use('/',routes);

// User.findOneAndUpdate({email: 'tylergaugler16@gmail.com'},{firstname: 'Tyler'}, function(err, user){
//   if(err) throw err;
//   console.log(user);
// });




app.listen(process.env.PORT || 3000, function(){
  console.log("listening on port 3000");
});
