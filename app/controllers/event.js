var mongoose = require( 'mongoose' ),
    Event = mongoose.model('Event'),
    User = mongoose.model('User', 'userSchema');


exports.list = function(req, res){

  Event.find(function(err, events) {
    if(err){
      console.log(err)
    }
    else{
      res.render('./events/index',{events: events, message: req.flash('message')});
    }
  }).sort( {date: 1});
};

exports.findEventById = function(req, res){
  Event.find({_id: req.params.id}, function(err, event){
    if(err) res.send('could not find event with that id');
    else{
      res.render('./events/show', {event: event[0], message: req.flash('message')});
    }
  });
};

exports.new = function(req, res){
  res.render('./events/new');
}

exports.create = function(req,res){
  console.log(req.body);
  d = req.body.date.split(' '); //gives us an array of 3. date, time, and then am/pm
  // req.body.period = d[2]
  date = d[0].split('-');
  time = d[1].split(':');
  new_date = new Date(date[2],  parseInt(date[0])-1, date[1], time[0], time[1]);
  req.body.date = new_date ;
  var event = new Event(req.body);
  event.save(function(err){
    // if(err) res.redirect('/events/new');
    if(err) res.send(err);
    else {
      console.log('saved event!');
      res.redirect('/events/'+event._id);
    }
  });
}

exports.register = function(req, res){
  console.log("heeree");
  // User.find(function(err, users){
  //   console.log(users);
  // });

  Event.findOne({_id: req.params.id}, function(err, event){
    if(err) res.redirect('/');
    console.log(req.user._id);
    User.update({_id: req.user._id}, {$addToSet: { eventsRegisteredFor: event } }, function(err, user){
      if(err)console.log(err);
      else console.log(user);
      req.flash('message', 'Registered for '+ event.title);
      res.redirect('/events')
    });

  });

}

exports.delete = function(req, res){

}
