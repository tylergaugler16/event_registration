exports.home = function(req, res){
console.log(req.user);
if(req.user) user = req.user;
else user = null;
res.render('./dashboard/dashboard', {user: user});
}
