const users = require('../controllers/user.js');
const events = require('../controllers/event.js');
const dashboard = require('../controllers/dashboard.js');
const open_gym = require('../controllers/open_gym.js');
const spreadsheets = require('../controllers/spreadsheets.js');
const admin = require('../controllers/admin.js');
const express = require('express');
const Router = express.Router();

function isLoggedIn(req,res,next){
  if(req.session.passport.user) return next();
  else res.redirect('/users/login');
}
//only for login. will log users out who try and go to login.
function isNotLoggedIn(req,res,next){
  if( !req.isAuthenticated() ) return next();
  else res.redirect('/users/logout');
}
var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/');
}
var isAdmin = function(req, res, next){
  if(req.isAuthenticated() && req.user.status == 'admin') return  next();
  res.redirect('/');
}


module.exports = function(passport, upload){
  Router.route('/users/fix_one/:email').get(users.fixOne);
  Router.route('/users/fix_all').get(users.fixAll);
  Router.route('/users').get(isAdmin, users.list);
  Router.route('/users/signup').get(users.signup);
  Router.route('/users/signup').post(users.create);
  Router.route('/users/delete/:id').get(users.delete);
  Router.route('/users/login').get(isNotLoggedIn, users.login);
  Router.route('/users/login').post(isNotLoggedIn, passport.authenticate('login',{failureRedirect: '/', failureFlash : true}), users.signin);
  Router.route('/users/upload_photo').post(isAuthenticated, upload.single('user_photo'), users.upload_photo);
  Router.route('/users/logout').get(users.logout);
  Router.route('/users/create_password_token').post(users.create_password_token);
  Router.route('/users/forgot_password').get( users.forgot_password);
  Router.route('/users/reset/:token').get(users.reset_password);
  Router.route('/users/reset/:token').post(users.reset_password_post);
  Router.route('/users/:id/edit').get(users.edit);
  Router.route('/users/:id/update').post(users.update);
  Router.route('/users/:id').get(isAuthenticated, users.findUserById); // should probably be last users/ route



  Router.route('/events/new').get(isAdmin, events.new);
  Router.route('/events/create').post(isAdmin, events.create);
  Router.route('/events/register/:id').get(isAuthenticated, events.register);
  Router.route('/events').get(events.list);
  Router.route('/events/:id').get(isLoggedIn, events.findEventById); // should probably be the last events/ route

  Router.route('/open_gym/info').get(open_gym.info);
  Router.route('/open_gym/register').get(isAuthenticated, open_gym.register);
  Router.route('/open_gym/register_children').post(isAuthenticated, open_gym.register_children);
  Router.route('/open_gym/registered/children').get(isAdmin, open_gym.registered_index);
  Router.route('/open_gym/registered/parents').get(isAdmin, open_gym.registered_parents_index);
  Router.route('/open_gym/registered/children/:id/edit').get(open_gym.edit_child);
  Router.route('/open_gym/registered/children/:id/update').post(open_gym.update_child);
  Router.route('/open_gym/weekly_attendance/new').get(isAdmin, open_gym.new_weekly_attendance);
  Router.route('/open_gym/weekly_attendance/create').post(isAdmin, open_gym.create_weekly_attendance);
  Router.route('/open_gym/weekly_attendance/delete/:id').get(isAdmin, open_gym.delete_attendance);
  Router.route('/open_gym/weekly_attendance/find_user').post(isAdmin, open_gym.find_user);
  Router.route('/open_gym/weekly_attendance/download/:date').get(isAdmin, spreadsheets.download_weekly_attendance);
  Router.route('/open_gym/weekly_attendance/view/:date').get(isAdmin, open_gym.weekly_attendance_view);
  Router.route('/open_gym/weekly_attendance/signin/:date').get(isAdmin, open_gym.signin);
  Router.route('/open_gym/weekly_attendance/signout/:date').post(isAdmin, open_gym.signout);
  Router.route('/open_gym/weekly_attendance/:date').get(isAdmin, open_gym.weekly_attendance);




  Router.route('/admin').get(isAdmin, admin.home)
  Router.route('/admin/spreadsheets').get(isAdmin, spreadsheets.index);
  Router.route('/admin/spreadsheets/create').get(isAdmin, spreadsheets.create);
  Router.route('/admin/weekly_attendance').get(isAdmin, open_gym.weekly_attendance_for_admin);



  Router.route('/').get(dashboard.home);
  // add wildcard Route to page_not_found

  return Router
}




// module.exports = Router;
