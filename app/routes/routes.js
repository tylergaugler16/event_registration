const users = require('../controllers/user.js');
const events = require('../controllers/event.js');
const dashboard = require('../controllers/dashboard.js');
const open_gym = require('../controllers/open_gym.js');
const express = require('express');
const Router = express.Router();


Router.route('/users').get(users.list);
Router.route('/users/signup').get(users.signup);
Router.route('/users/signup').post(users.create);
Router.route('/users/login').get(users.login);
Router.route('/users/login').post(users.signin);
Router.route('/users/:id').get(users.findUserById); // should probably be last users/ route


Router.route('/events/new').get(events.new);
Router.route('/events/create').post(events.create);
Router.route('/events').get(events.list);
Router.route('/events/:id').get(events.findEventById); // should probably be the last events/ route

Router.route('/open_gym/info').get(open_gym.info);
Router.route('/open_gym/register').get(open_gym.register);
Router.route('/open_gym/register_children').post(open_gym.register_children);

Router.route('/').get(dashboard.home);


module.exports = Router;
