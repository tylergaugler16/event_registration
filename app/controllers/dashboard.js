exports.home = function(req, res){
  message = req.flash('message');
  res.render('./dashboard/dashboard', {message: message});
}
