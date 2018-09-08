var mongoose = require( 'mongoose' ),
    Event = mongoose.model('Event'),
    User = mongoose.model('User', 'userSchema');


exports.list = function(req, res){

  Event.find(function(err, events) {
    if(err){
      req.flash('error_message', 'Error MESSAGE');
      res.render('./dashboard/dashboard')
    }
    else{
      res.render('./events/index',{events: events, message: req.flash('message')});
    }
  }).sort( {date: 1});
};

exports.findEventById = function(req, res){
    Event.findOne({_id: req.params.id}, function(err, event){
      if(err){
        req.flash('error_message', 'Could not find Event');
        res.redirect('/');
      }
      else{
        User.find({eventsRegisteredFor: event.id}, function(err, users){
          if(err) console.log("ERROR");
          else {
            var registered = false;
            for(var i =0 ;i< res.locals.current_user.eventsRegisteredFor.length; i++){
              console.log(res.locals.current_user.eventsRegisteredFor[i] );
              if((res.locals.current_user.eventsRegisteredFor[i]) && event._id.toString() == res.locals.current_user.eventsRegisteredFor[i].toString() ){
                 registered = true;
              }
            }
            res.render('./events/show', {event: event, registered: registered, user_list: users, });

          }
        });



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
    if(err) {
      req.flash('error_message', 'Error saving Event!');
      res.redirect('/');
    }
    else {
      res.redirect('/events/'+event._id);
    }
  });
}

exports.register = function(req, res){

  Event.findOne({_id: req.params.id}, function(err, event){
    if(err) {
      req.flash('message', 'Could not find event with id: '+req.params.id);
      res.redirect('/');
    }
    else{
      console.log(req.user._id);
      User.update({_id: req.user._id}, {$addToSet: { eventsRegisteredFor: event } }, function(err, user){
        if(err)console.log(err);
        else console.log(user);
        req.flash('message', 'Registered for '+ event.title);
        res.redirect('/events')
      });
    }


  });

}

exports.delete = function(req, res){

}
