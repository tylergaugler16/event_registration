// var Event = require('../models/event.js');
var mongoose = require( 'mongoose' ),
    Event = mongoose.model('Event');

exports.list = function(req, res){
  Event.find(function(err, events) {
    if(err){
      console.log(err)
    }
    else{
      console.log(events);
      res.render('./events/index',{events: events});
    }

  });
};
exports.findEventById = function(req, res){
  console.log(req.params.id);
  Event.find({_id: req.params.id}, function(err, event){
    if(err) res.send('could not find event with that id');
    else{
      console.log(event);
      res.render('./events/show', {event: event[0]});
    }
  });
};

exports.new = function(req, res){
  res.render('./events/new');
}
exports.create = function(req,res){
  console.log(req.body);
  var event = new Event(req.body);
  console.log(event);
  event.save(function(err){
    // if(err) res.redirect('/events/new');
    if(err) res.send(err);
    else {
      console.log('saved event!');
      res.redirect('/events/'+event._id);
    }
  });
}
