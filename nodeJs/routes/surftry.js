var express= require("express");
var bcrypt= require("bcrypt");
var router= express.Router();
var mongoose=require('mongoose');
var nodemailer = require('nodemailer');
var passport= require('passport');
var http= require('http');
//var nev= require('email-verification')(mongoose);
//Bringing the Models
var passwordValidator = require('password-validator');
var crypto= require('crypto');
var postmark = require("postmark");
var smtpTransport= require('nodemailer-smtp-transport');
var info= require('../models/usertry');
var token= require('../models/verftoken');
var authi= require('../models/authtoken');
var otptok= require('../models/otptoken');
var rstok= require("../models/resettoken");
var wall= require("../models/createwallet");
//var nxt= require("crwall");
var client = new postmark.Client("b8458926-dc13-441b-b74c-2d92de2516e5");
var app=express();
var verfotp= false;


//const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    	host: 'host.moviemaa.com',
    	port: 465,
    	secure: true, // secure:true for port 465, secure:false for port 587
    	transportMethod: "SMTP",
        auth: {
        	user: 'mail@iitbit.com',
        	pass: 'Apsara005'
    	}
});


//var wal_id= require('crwall');
//router.use("/",wal_id);


//Loging Post
/*router.post('/login',function(req,res,next){
	passport.authenticate('local',{
		//failWithError: true
		successRedirect: '/success.json',
		failureRedirect: '/failure.json'
		//failureFlash: true
	}
	)(req, res, next);
});

router.get('/success.json',function(req,res){
	res.json({"success":"true","info":"Login Success"});
});

router.get('/failure.json',function(req,res){
        res.json({"success":"fail","info":"Login Failure"});
});*/

//Login Post
router.post('/login',function(req,res){
	var email=req.body.email;
	var password=req.body.password;

	req.checkBody('email','Email is Required').notEmpty();
        req.checkBody('email','Email is not Valid').isEmail();
        req.checkBody('password','Password is Required').notEmpty();

	var errors= req.validationErrors();

        if(errors)
        {
                console.log('Error in Validation OR error in Uplodaing'+ errors);
                return res.status(200).json({"success":"false", "info":errors});
        }
	
	info.findOne({email:email},function(err,user){
		if(err){
			return res.status(200).json({"success":"false","info":"Email not registered"});

		}
		if(!user){
			return res.status(200).json({"success":"false","info":"Email not registered"});
		}
		if(user.isVerified){
		bcrypt.compare(password, user.password, function(err, isMatch){
    	                console.log("Here it is");
                        if(err) throw err;
                        if(isMatch){

				if(!user.walletCreated){
					var data = JSON.stringify({
                				api_code: 'cd0ebd41-3673-4096-8698-fdf738dbdf2e',
                				//email: email,
                				password: password,
                				hd: true
        				});

        				var options = {
                				host: 'localhost',
                				port: 3030,
                				path: '/api/v2/create',
                				method: 'POST',
                				headers: {
                        				'Content-Type': 'application/json'
                				}
        				};

        				var req	= http.request(options, function(res) {
                				res.setEncoding('utf8');
                				res.on('data', function (chunk) {
                        				chunk = JSON.parse(chunk);
                        				var guid= chunk.guid;
                        				var add= chunk.address;
                        				//console.log(guid+"\n"+add);
                        				//console.log(rguid + "\n" + radd);
                        				var newWall= new wall({
                                				_userId: user._id,
                                				pin: Math.floor(Math.random()*(999999-100000)+100000),
                                				wallet_pass: password,
								//rec_add: crypto.randomBytes(16).toString('hex'),
                                				guid: guid,
                                				xpub_add: add
                        				});

							/*var data = JSON.stringify({
                                                		api_code: 'cd0ebd41-3673-4096-8698-fdf738dbdf2e',
                                                		//email: email,
                                                		//guid: wallet.guid,
                                                		//xpub: wallet.xpub_add,
                                                		password: password
                                        		});

                                        		var options = {
                                                		host: 'localhost',
                                                		port: 3030,
                                                		path: '/merchant/'+wall.guid+'/accounts/'+wall.xpub_add+'/receiveAddress',
                                                		method: 'POST',
                                                		headers: {
                                                        		'Content-Type': 'application/json'
                                                		}
                                        		};

                                        		var req = http.request(options, function(response){
                                                		response.setEncoding('utf8');
                                                		response.on('data', function (chunk) {
                                                        		chunk = JSON.parse(chunk);
                                                        		//res.json({"recieving address":chunk.address});
                                                        		//var address= chunk.address;
									wall.rec_add=chunk.address;
                                                		});
                                        		});
                                        		req.write(data);
                                        		req.end();*/
					 	bcrypt.genSalt(10, function(err,salt){
                        				if(err){
                                				console.log("Error in Encryption");
                                 				console.log(err);
                        				}
                        				bcrypt.hash(newWall.wallet_pass,salt,function(err,hash){
                                				if(err){
                                        				console.log("Error in Hashing");
                                        				console.log(err);
                                				}
                                				newWall.wallet_pass= hash;
                                				console.log("Password: "+ newWall.wallet_pass);
                                				newWall.save(function(err){
                                        				if(err){
                                                				console.log("Error in Saving");
                                                				console.log(err);
                                        				}
                                        				console.log("Data Saved in DataBase");
									info.update({_id: user._id},{walletCreated: true},function(err){
										if(err){
											console.log(err);
										}
										console.log("Wallet successfully Created");
									});
                                        //res.send('SuccessFully Registered');
                                				});
							});
						});
						});
					});
					req.write(data);
					req.end();
				}
//---------------------------------------------------------------------------------------------------------------------------//
				var authtok= new authi({
					_userId: user._id,
					token: crypto.randomBytes(16).toString('hex')
				});
				authtok.save(function(err){
					if(err){
						return res.status(200).json({"success":"false","info":"Server Down"});
					}
				
       	               			res.json({"success":"true","info":"Login Success","data":{
						"auth_token":authtok.token,
						"email": user.email,
						"name": user.name
					}});
				});
              	             	console.log("Password Matched");
                        }
                        else{
                          	return res.json({"success":"false","info":"email or password incorrect"});
                                //return done(null, false, console.log("Wrong Password"));
                        }
            	});
		}
		else{
                      	return res.status(200).json({"success":"false","info":"Verify your email"});
             	}
	});
});

//Logout Post
router.post('/logout',function(req,res){
        var email=req.body.email;
        var auth_token=req.body.auth_token;

        req.checkBody('email','Email is Required').notEmpty();
        req.checkBody('email','Email is not Valid').isEmail();
        
        var errors= req.validationErrors();

        if(errors)
        {
                console.log('Error in Validation OR error in Uplodaing');
                return res.send({"success":"false", "info":errors});
        }
	info.findOne({email: email},function(err, user){
		if(err) throw err;
		if(!user){
			return res.status(200).json({"success":"false","info":"User not found"});
		}
		authi.remove({_userId: user._id, token: auth_token},function(err){
                        if(err) throw err;
			return res.status(200).json({"success":"true","info":"Successfully logged out"});
                });	
	});
});


//Signp Get
/*router.get('/signup',function(req,res){
        info.find()
        .then(function(data){
                console.log('To send');
                res.send(data);
        })
});*/
	
router.post('/confirmation',function(req, res, next){
//	req.assert('email', 'Email is not valid').isEmail();
//    	req.assert('email', 'Email cannot be blank').notEmpty();
//    	req.assert('token', 'Token cannot be blank').notEmpty();
//    	req.sanitize('email').normalizeEmail({ remove_dots: false });
 
    	// Check for validation errors    
    	//var errors = req.validationErrors();
    	//if (errors) return res.status(400).send(errors);
	var email= req.body.email;
	var otp= req.body.otp;
 
    	// Find a matching token
    	info.findOne({ email: email }, function (err, user) {
        if (!user){ 
		return res.status(200).json({"success":"false","info":"user not found"});
	}
 
        // If we found a token, find a matching user
        token.findOne({ _userId: user._id }, function (err, tokenin) {
         	if (!tokenin) return res.status(200).json({"success":"false","info":"OTP incorrect"});
		if(tokenin.token===otp){
            	if (user.isVerified) return res.status(200).json({"success":"false","info":"User already Verified"});
 
            	// Verify and save the user
       		user.isVerified = true;
        	user.save(function (err){
		if (err) { 
			return res.status(500).json({"success":"false","info":"Server problem. Try again later"}); 
		}
                res.status(200).json({"success":"true","info":"User verified"});
        	});}
		else{
			return res.status(200).json({"success":"false","info":"Invalid OTP"});
		}
        });
    });
});

router.post('/resend',function (req, res, next){
    	req.assert('email', 'Email is not valid').isEmail();
    	req.assert('email', 'Email cannot be blank').notEmpty();
    	req.sanitize('email').normalizeEmail({ remove_dots: false });
 
    	// Check for validation errors    
    	//var errors = req.validationErrors();
    	//if (errors) return res.status(400).send(errors);
 
    	info.findOne({ email: req.body.email }, function (err, user) {
        	if (!user){ 
			return res.status(200).json({"success":"false","info":"We were unable to find a user with that email."});
		}
        	if (user.isVerified){ 
			return res.status(200).send({"success":"false","info":"This account has already been verified. Please log in."});
		}
		token.remove({_userId: user._id},function(err){
			if(err) throw err;
		});
 
        	// Create a verification token, save it, and send email
        	var tokenin = new token({ 
			_userId: user._id, 
			token: Math.floor(Math.random()*(999999-100000)+100000) 
		});
 
        	// Save the token
        	tokenin.save(function (err) {
            		if (err) { 
				return res.status(503).json({"success":"false","info":"Error in saving"}); 
			}
		let mailOptions = {
   	 		from: '<mail@iitbit.com>', // sender address
    			to: user.email, // list of receivers
    			subject: 'OTP for Email verification ', // Subject line
    			text: 'Hello,\n\n' + '\tThis is your OTP: '+tokenin.token +'\nUse this for verification', // plain text body
    			html: '<b>Hello\n' + '\tThis is your OTP: '+tokenin.token +'\nUse this for verification</b>'
		};

		transporter.sendMail(mailOptions, function(error, info)  {
    			console.log('So...');
    			if (error) {
        			return console.log(error);
    			}
        		res.status(200).json({"success":"true","info": 'Verification OTP sent to email'});
    			console.log('Message %s sent: %s', info.messageId, info.response);
		});
		});
	});
});

//FOR comfirmation and resendTokenPost
//router.post('/confirmation', confirmationPost);
//router.post('/resend', resendTokenPost);

//Resend OTP for Forgot Password
router.post('/forgotresend',function (req, res, next){
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('email', 'Email cannot be blank').notEmpty();
        req.sanitize('email').normalizeEmail({ remove_dots: false });

        // Check for validation errors
        //var errors = req.validationErrors();
        //if (errors) return res.status(400).send(errors);

        info.findOne({ email: req.body.email }, function (err, user) {
                if (!user){
                        return res.status(200).json({"success":"false","info":"We were unable to find a user with that email."});
                }
                if(!user.isVerified){
			return res.status(200).json({"success":"false","info":"user not verified"});
		}
                otptok.remove({_userId: user._id},function(err){
                        if(err) throw err;
                });

                // Create a verification token, save it, and send email
                var otptokenin = new otptok({
                        _userId: user._id,
                        token: Math.floor(Math.random()*(999999-100000)+100000)
                });

                // Save the token
                otptokenin.save(function (err) {
                        if (err) {
                                return res.status(503).json({"success":"false","info":"Error in saving"});
                        }
			let mailOptions = {
                        from: '<mail@iitbit.com>', // sender address
                        to: user.email, // list of receivers
                        subject: 'OTP for Email verification ', // Subject line
                        text: 'Hello,\n\n' + '\tThis is your OTP: '+otptokenin.token +'\nUse this for verification', // plain text body
                        html: '<b>Hello\n' + '\tThis is your OTP: '+otptokenin.token +'\nUse this for verification</b>'
                };

                transporter.sendMail(mailOptions, function(error, info)  {
                        console.log('So...');
                        if (error) {
                                return console.log(error);
                        }
                        res.status(200).json({"success":"true","info": 'Verification OTP sent to email'});
                        console.log('Message %s sent: %s', info.messageId, info.response);
                });
                });
        });
});



//Signup Part
router.post('/signup',function(req,res){

	console.log("THIS IS SURF.JS");
        const name= req.body.name;
        const email= req.body.email;
        const password= req.body.password;
        const password2= req.body.password2;
	const gender= req.body.gender;
	const dob= req.body.dob;
	const mobile= req.body.mobile;
        req.checkBody('name','name is Required').notEmpty();
        req.checkBody('email','Email is Required').notEmpty();
        req.checkBody('email','Email is not Valid').isEmail();
        req.checkBody('password','Password is Required').notEmpty();
        req.checkBody('password2','Passwords do not match').equals(req.body.password);
        req.checkBody('dob','Date of Birth is Required').notEmpty();
        req.checkBody('mobile','Mobile number is Required').notEmpty();
        req.checkBody('gender','Gender is Required').notEmpty();
       // req.checkBody('email','Email is Required').notEmpty();
	var schema = new passwordValidator();

// Add properties to it
	schema
	.is().min(8)                                    // Minimum length 8
	.is().max(100)                                  // Maximum length 100
	.has().uppercase()                              // Must have uppercase letters
	.has().lowercase()                              // Must have lowercase letters
	.has().digits()                                 // Must have digits
	.has().not().spaces()                          // Should not have spaces
	.has().symbols()
	.is().not().oneOf(['Password', 'Password123', 'qwerty']);  // Blacklist these values

	console.log(schema.validate(req.body.password));
	// => true
	//console.log(schema.validate('invalidPASS'));
	// => false
	//console.log(schema.validate(req.body.password, { list: true }));
	var errors= req.validationErrors();
	
        if(errors)
        {
                console.log('Error in Validation OR error in Uplodaing');
                return res.send({"success":"false", "info":errors});
        }
        else
        {
	if(schema.validate(req.body.password)){
                var newUser= new info({
                        name: name,
                        email: email,
                        password: password,
			gender: gender,
			dob: dob,
			mobile: mobile
                });
		if(info.findOne({email: req.body.email}, function(err, user){
			if(user){
				return res.status(200).send({"success":"false","info": 'The email you Entered is already registered'});
			}
		}));	
                bcrypt.genSalt(10, function(err,salt){
                        if(err){
                                console.log("Error in Encryption");
				 console.log(err);
                        }
                     	bcrypt.hash(newUser.password,salt,function(err,hash){
                       		if(err){
                                	console.log("Error in Hashing");
                                	console.log(err);
                        	}
                        	newUser.password= hash;
                        	console.log("Password: "+ newUser.password);
                        	newUser.save(function(err){
                        		if(err){
                                		console.log("Error in Saving");
                                		console.log(err);
                        		}
                        		console.log("Data Saved in DataBase");
                        		//res.send('SuccessFully Registered');
                        	});
				var tokenin = new token({
                                      	_userId: newUser._id,
                                      	//token: crypto.randomBytes(16).toString('hex')
					token: Math.floor(Math.random()*(999999-100000)+100000)
                                });
				tokenin.save(function (err) {
                                       	if (err) {
                                              	return res.status(503).json({"success":"false","info":"Server Down"});
                                     	}
					console.log("Before MailOption");

/*					client.sendEmail({
    						"From": "admin@iniwu.com",
    						"To": newUser.email,
   						"Subject": "JOB OFFER",
						"TextBody": 'Hello,\n\n' + '\tThis is your OTP: '+tokenin.token +'\nUse this for verification'
					});
					res.status(200).send('A verification email has been sent to ' + newUser.email + '.');
*/

					let mailOptions = {
    						from: '<mail@iitbit.com>', // sender address
  	  					to: newUser.email, // list of receivers
    						subject: 'OTP for Email verification ', // Subject line
    						text: 'Hello,\n\n' + '\tThis is your OTP: '+tokenin.token +'\nUse this for verification', // plain text body
    						html: '<b>Hello\n' + '\tThis is your OTP: '+tokenin.token +'\nUse this for verification</b>'
};

					transporter.sendMail(mailOptions, function(error, info)  {
    						console.log('So...');
    						if (error) {
        						return console.log(error);
   				 		}
						res.status(200).json({"success":"true","info": 'Verification OTP sent to email'});
    						console.log('Message %s sent: %s', info.messageId, info.response);
					});

				});
                        });
                });
        
	}
	else {
	 return res.status(500).send({"success":"false", "info":schema.validate(req.body.password, { list: true , function(err){
	console.log(err);		
}})});
	}
	}
});

router.post('/forgotpassword',function(req, res){
	var email= req.body.email;
	req.checkBody('email','Email is Required').notEmpty();
        req.checkBody('email','Email is not Valid').isEmail();
	var errors= req.validationErrors();

        if(errors)
        {
                console.log('Error in email id');
                return res.status(200).json({"success":"false","info":"Invalid email"});
        }

	info.findOne({email: email},function(err,user){
		verfotp= false;
		if(err){
			return res.status(200).json({"success":"false","info":"User not Found"});
		}
		if(!user.isVerified){
			return res.status(200).json({"success":"false","info":"user not verified"});
		}
		if(!user){
                      	return res.status(200).json({"success":"false","info":"Email not registered"});
                }
		var otptokenin = new otptok({
                     	_userId: user._id,
                        token: Math.floor(Math.random()*(999999-100000)+100000)
                });
		otptokenin.save(function(err){
			if(err){
				return res.status(503).json({"success":"false","info":"Server Down"});
			}

			let mailOptions = {
    				from: '<mail@iitbit.com>', // sender address
    				to: user.email, // list of receivers
    				subject: '"Confirmation of OTP', // Subject line
    				text:' Hello,\n\n' + '\tThis is your OTP: ' + otptokenin.token + '.\n Use this for verification.\n', // plain text body
    				html: '<b>Hello\n' + '\tThis is your OTP: '+otptokenin.token +'\nUse this for verification</b>' // html body
			};

			transporter.sendMail(mailOptions, function(error, info)  {
    				console.log('So...');
				//mailOptions.to=user.email;
    				if (error) {
        				return console.log(error);
    				}
				res.status(200).json({"success":"true","info": 'Verification OTP sent to email'});
    				console.log('Message %s sent: %s', info.messageId, info.response);
			});
		});
	});
});

router.post('/confirmotp',function(req,res,next){
	var email= req.body.email;
	req.checkBody('email','Email is Required').notEmpty();
        req.checkBody('email','Email is not Valid').isEmail();
        var errors= req.validationErrors();

        if(errors)
        {
                console.log('Error in email id');
                return res.status(200).json({"succss":"false","info":"Valid Email Required"});
        }
	var otp = req.body.otp;
	info.findOne({email: email}, function(err,user){
		if(err){
			return res.status(200).json({"success":"false","info":"User not found"});
		}
		otptok.findOne({_userId: user._id},function(err,tokenin){
			console.log("Otp:"+tokenin.token);
			if(err){
				return res.status(200).json({"success":"false","info":"Invalid OTP. Send it Again"});
			}
			if(tokenin.token===otp){
				var restoken= new rstok({
					_userId: user._id,
					token: crypto.randomBytes(16).toString('hex')
				});
				restoken.save(function(err){
					if(err){
						return res.status(503).json({"succss":"false","info":"Server Down"});
					}
					return res.status(200).json({"success":"true","info":"OTP verification successful","data":{
		//	"res_token": restoken.token,
			"email": user.email,
			"name": user.name
			},
			"res_token": restoken.token
					});
				});
			}
			else{
				return res.status(200).json({"success":"false","info":"Enter OTP correctly"});
			}
		});
	});
});

router.post('/reset',function(req,res){

	/*if(err){
		return res.status(200).send('Error in Processing');		
	}*/
	var email= req.body.email;
        req.checkBody('email','Email is Required').notEmpty();
        req.checkBody('email','Email is not Valid').isEmail();
        var errors= req.validationErrors();

        if(errors)
        {
                console.log('Error in email id');
                return res.send(errors);
        }
	info.findOne({email: req.body.email},function(err,user){
		if(err){
			return res.status(200).send('Email ID not found');
		}
		var password= req.body.password;
		var password2= req.body.password2;
		var res_token= req.body.res_token;		
		req.checkBody('password','Password is Required').notEmpty();
        	req.checkBody('password2','Passwords do not match').equals(req.body.password);
		var errors= req.validationErrors();

        	if(errors)
        	{
               		console.log('Error in Validation OR error in Uplodaing');
               		return res.status(200).json({"success":"false","info":"Enter details correctly"});
       		}
		rstok.findOne({_userId: user._id},function(err,tokenin){
			if(err){
				return res.status(200).json({"success":"false","info":"TimeOut. Try re-sending OTP"});
			}
			if(!tokenin){
				return res.status(200).json({"success":"false","info":"reset password timeout"});
			}
			if(tokenin.token===res_token){
				bcrypt.genSalt(10, function(err,salt){
                        	if(err){
                                	console.log("Error in Encryption");
                                 	console.log(err);
                        	}
                        	bcrypt.hash(password2,salt,function(err,hash){
                                	if(err){
                                        	console.log("Error in Hashing");
                                        	console.log(err);
                                	}
                             		info.update({_id: user._id},{password: hash},function(err){
						if(err){
							return res.status(503).json({"success":"false","info":"Server Down"});
						}
					});
                                	//console.log("Password: "+ user.password);
				});
				authi.remove({_userId: user._id},function(err){
					if(err) throw err;
			        });
				return res.status(200).json({"success":"true","info":"Password Successfully Changed"});
				});
			}
			else{
				rstok.remove({_userId: user._id},function(err){
					console.log("error here");
					if(err) throw err;
				});
				return res.status(200).json({"success":"false","info":"Wrong info"});
			}
	
		});
	});	
});

module.exports= router;
