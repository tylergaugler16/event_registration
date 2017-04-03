const users = require('../controllers/user.js');
const dashboard = require('../controllers/dashboard.js');
const events = require('../controllers/event.js');
const express = require('express');
const Router = express.Router();


Router.route('/users').get(users.list);
Router.route('/users/signup').get(users.signup);
Router.route('/users/signup').post(users.create);
Router.route('/users/:id').get(users.findUserById); // should probably be last users/ route

Router.route('/events/new').get(events.new);
Router.route('/events/create').post(events.create);
Router.route('/events').get(events.list);
Router.route('/events/:id').get(events.findEventById);

Router.route('/').get(dashboard.home);


module.exports = Router;
