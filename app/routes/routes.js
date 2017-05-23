const users = require('../controllers/user.js');
const events = require('../controllers/event.js');
const dashboard = require('../controllers/dashboard.js');
const open_gym = require('../controllers/open_gym.js');
const spreadsheets = require('../controllers/spreadsheets.js');
const admin = require('../controllers/admin.js');
const express = require('express');
const Router = express.Router();

function isLoggedIn(req,res,next){
  if(req.session.user) return next();
  else res.redirect('/users/login');
}

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/');
}
var isAdmin = function(req, res, next){
  if(req.isAuthenticated() && req.user.status == 'admin') return  next();
  res.redirect('/');
}

module.exports = function(passport){
  Router.route('/users').get(isAdmin, users.list);
  Router.route('/users/signup').get(users.signup);
  Router.route('/users/signup').post(users.create);
  Router.route('/users/login').get(users.login);
  Router.route('/users/login').post(passport.authenticate('login',{failureRedirect: '/', failureFlash : true}), users.signin);
  Router.route('/users/logout').get(users.logout);
  Router.route('/users/:id').get(isAuthenticated, users.findUserById); // should probably be last users/ route


  Router.route('/events/new').get(isAdmin, events.new);
  Router.route('/events/create').post(isAdmin, events.create);
  Router.route('/events/register/:id').get(isAuthenticated, events.register);
  Router.route('/events').get(events.list);
  Router.route('/events/:id').get(events.findEventById); // should probably be the last events/ route

  Router.route('/open_gym/info').get(open_gym.info);
  Router.route('/open_gym/register').get(isAuthenticated, open_gym.register);
  Router.route('/open_gym/register_children').post(isAuthenticated, open_gym.register_children);
  Router.route('/open_gym/weekly_attendance').get(isAdmin, open_gym.weekly_attendance);
  Router.route('/open_gym/find_user').post(isAdmin, open_gym.find_user);

  Router.route('/admin').get(isAdmin, admin.home)
  Router.route('/admin/spreadsheets').get(isAdmin, spreadsheets.index);
  Router.route('/admin/spreadsheets/create').get(isAdmin, spreadsheets.create);



  Router.route('/').get(dashboard.home);
  // add wildcard Route to page_not_found

  return Router
}




// module.exports = Router;
