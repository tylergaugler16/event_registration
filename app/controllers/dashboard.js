exports.home = function(req, res){
if(req.session.user) user = req.session.user;
else user = null;
res.render('./dashboard/dashboard', {user: user});
}
