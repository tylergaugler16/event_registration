exports.home = function(req, res){
res.render('./admin/index', {message: req.flash('message')});
}
