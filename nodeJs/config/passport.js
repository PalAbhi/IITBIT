var LocalStrategy= require('passport-local').Strategy;
var User= require('../models/usertry');
var config= require('../config/database');
var bcrypt= require('bcryptjs');
var flash= require('connect-flash');

module.exports= function(passport){
	//Local Strategy
	console.log("Starting Here");
	passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'},
		function(username, password, done, res){
		//Match username
		//console.log("Username: "+username);
		var query= {email:username};
		//console.log("Hello I am Here");
		User.findOne(query, function(err, user){
			if(err){
				console.log(err);
			}
			if(!user){
				return done(null, false, console.log("User not Found"));
			}
			
			//Match Password
			bcrypt.compare(password, user.password, function(err, isMatch){
				console.log("Here it is");
				if(err) throw err;
				if(isMatch){
					//res.json({"success":"true","info":"Login Success"});
					console.log("Password Matched");
					return done(null, user);
				}
				else{
					//res.json({"success":"false","info":"Login Fails"});
					return done(null, false, console.log("Wrong Password"));
				}
			});
		});
	}));
	
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});
	
	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		});
	});
}
		
