const users = require('../controllers/user.js');
const express = require('express');
const Router = express.Router();


Router.route('/users').get(users.list);

Router.route('/users/signup').get(users.signup);
Router.route('/users/signup').post(users.create);
Router.route('/users/:id').get(users.findUserById); // should probably be last users/ route

Router.get('/', function(req, res){
  res.send("yeeeet");
})

module.exports = Router;
