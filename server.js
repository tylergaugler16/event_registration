const express = require('express');
const app = express();
const db = require('./app/models/db');
const logger = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('client-sessions');
const flash = require('connect-flash');

const multer = require('multer');
const upload = multer({dest: 'public/user_images/'});
const env = process.env.NODE_ENV || 'dev';

const mongoose = require( 'mongoose' ),
    User = mongoose.model('User', 'userSchema');
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', './app/views');
app.use(express.static('public'));
app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',  // random string to encrypt cookie
  duration: 24 * 60 * 60 * 1000,
  // activeDuration: 5 * 60 * 10000,
  httpOnly: (env == 'dev'),
  secure: (env == 'production'),
  ephemeral: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
  if(req.user) res.locals.current_user = req.user;
  else res.locals.current_user = null;
  // console.log(req.flash('success_messages'));
  // if(req.flash('success_messages')){
  //   res.locals.success_messages = req.flash('success_messages');
  // }
  res.locals.messages = req.flash();
  // else res.locals.success_messages = null;


  error_messages = {
    event_not_found: 'Event could not be found!',
    user_not_found: 'User could not be found!'
  };
  next();
});


const initPassport = require('./passport/init');
initPassport(passport);
const routes = require('./app/routes/routes.js')(passport,upload);
app.use('/',routes);


app.listen(process.env.PORT || 3000, function(){
  console.log("listening on port 3000");
});
