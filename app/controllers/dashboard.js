exports.home = function(req, res){
res.render('./dashboard/dashboard', {message: req.flash('message')});
}
