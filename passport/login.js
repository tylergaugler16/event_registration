var LocalStrategy   = require('passport-local').Strategy;
var mongoose = require( 'mongoose' ),
    User = mongoose.model('User', 'userSchema');
var bcrypt = require('bcrypt');

module.exports = function(passport){

	passport.use('login', new LocalStrategy({
						usernameField: 'email',
            passReqToCallback : true
        },
        function(req, email, password, done) {
          email = email.toLowerCase();
            // check in mongo if a user with username exists or not
            User.findOne({ 'email' :  email },
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        console.log('User Not Found with email '+email);
                        return done(null, false, req.flash('error_message', 'User Not found.'));
                    }
                    // User exists but wrong password, log the error
                    if (!isValidPassword(user, password)){
                        console.log('Invalid Password');
                        return done(null, false, req.flash('error_message', 'Invalid Password')); // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
										console.log("found user!");
                    return done(null, user, req.flash('success_message', 'Successfully Signed In'));
                }
            );

        })
    );


    var isValidPassword = function(user, password){
			return bcrypt.compareSync(password, user.password);
    }

}
