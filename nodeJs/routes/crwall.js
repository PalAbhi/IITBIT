var express= require('express');
var mongoose= require('mongoose');
var router= express.Router();
var http= require('http');
var bcrypt= require('bcrypt');
var info= require('../models/usertry');
var wall= require('../models/createwallet');
var nodemailer= require('nodemailer');

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

router.post('/pin',function(req, res){
	var email= req.body.email;
	//var password= req.body.password;
	//var api_code= req.body.api_code;
	var pin = req.body.pin;

	info.findOne({email: email},function(err, user){
		if(err){
			console.log("Error here");
			return res.status(503).json({"success":"false","info":"Server Down"});
		}
		
		if(!user){
			return res.status(200).json({"success":"false","info":"email incorrect"});
		}
		if(user.walletCreated){
			bcrypt.genSalt(10, function(err,salt){
                            	if(err){
                  	                console.log("Error in Encryption");
                                     	console.log(err);
                               	}
                                bcrypt.hash(pin,salt,function(err,phash){
                                      	if(err){
                                              	console.log("Error in Hashing");
                                              	console.log(err);
                                   	}
					wall.update({_userId: user._id},{pin: phash},function(err){
						if(err){
							console.log(err);
						}
						wall.update({_userId: user._id},{pinCreated: true},function(err){
							if(err){
								console.log(err);
							}
						wall.findOne({_userId: user._id},function(err, wallet){
							if(err){
								console.log(err);
							}
						let mailOptions = {
                        				from: '<mail@iitbit.com>', // sender address
                        				to: user.email, // list of receivers
                        				subject: 'Wallet Information Confidential ', // Subject line
                        				text: 'Hello,\n\n' + '\tThis is your Guid: '+wallet.guid +'\n\tThis is your xPub address:'+wallet.xpub_add+'.\n', // plain text body
                        				html: '<b>Hello,\n\n' + '\tThis is your Guid: '+wallet.guid +'\n'+'\n\tThis is your xPub address:'+wallet.xpub_add+'.\n</b>'
                				};

                				transporter.sendMail(mailOptions, function(error, info)  {
                        				console.log('So...');
                        				if (error) {
                                				return console.log(error);
                        				}
							console.log('Message %s sent: %s', info.messageId, info.response);
                        				res.status(200).json({"success":"true","info": 'Verification OTP sent to email'});
        					});
						//return res.status(200).json({"success":"true","info":"Pin successfully changed"});
						});
						});
					});
				});
			});
		}
		if(!user.walletCreated){
			return res.status(200).json({"success":"false","info":"please login successfully once"});
		}
	});
});


router.post('/recieveadd', function(req,res){
	var email= req.body.email;
	var password= req.body.password;
	
	info.findOne({email:email},function(err,user){
                if(err){
                        return res.status(200).json({"success":"false","info":"Email not registered"});
                }
                if(!user){
                        return res.status(200).json({"success":"false","info":"Email not registered"});
                }
		wall.findOne({_userId: user._id},function(err,wallet){
			
               		bcrypt.compare(password, wallet.wallet_pass, function(err, isMatch){
                        	console.log("Here it is");
                       		if(err) throw err;
                       		if(isMatch){
					var data = JSON.stringify({
                                                api_code: 'cd0ebd41-3673-4096-8698-fdf738dbdf2e',
                                                //email: email,
						//guid: wallet.guid,
						//xpub: wallet.xpub_add,
                                                password: password
                                        });

                                        var options = {
                                                host: 'localhost',
                                                port: 3030,
                                                path: '/merchant/'+wallet.guid+'/accounts/'+wallet.xpub_add+'/receiveAddress',
                                                method: 'POST',
                                                headers: {
                                                        'Content-Type': 'application/json'
                                                }
                                        };

                                        var req = http.request(options, function(response){
                                                response.setEncoding('utf8');
                                                response.on('data', function (chunk) {
                                                       	chunk = JSON.parse(chunk);
							res.json({"recieving address":chunk.address});
							//var address= chunk.address;
						});
					});
					req.write(data);
					req.end();
					//console.log(address);*/
					//res.json({"recieving address":wallet.rec_add});
				}
			});
		});
	});
});

router.post('/balance', function(req,res){
	var email= req.body.email;
	var password= req.body.password;

        info.findOne({email:email},function(err,user){
                if(err){
                        return res.status(200).json({"success":"false","info":"Email not registered"});
                }
                if(!user){
                        return res.status(200).json({"success":"false","info":"Email not registered"});
                }
                wall.findOne({_userId: user._id},function(err,wallet){
                        bcrypt.compare(password, wallet.wallet_pass, function(err, isMatch){
                                console.log("Here it is");
                                if(err) throw err;
                                if(isMatch){
                                        var data = JSON.stringify({
                                                api_code: 'cd0ebd41-3673-4096-8698-fdf738dbdf2e',
                                                //email: email,
                                                password: password
					});
					var options = {
                                                host: 'localhost',
                                                port: 3030,
                                                path: '/merchant/'+wallet.guid+'/accounts/'+wallet.xpub_add+'/balance',
                                                method: 'POST',
                                                headers: {
                                                        'Content-Type': 'application/json'
                                                }
                                        };

                                        var req = http.request(options, function(response) {
                                                response.setEncoding('utf8');
                                                response.on('data', function (chunk) {
                                                        chunk = JSON.parse(chunk);
                                                        res.status(200).json({"balance":chunk.balance});
                                                });
                                        });
                                        req.write(data);
                                        req.end();
				}
			});
		});
	});
});

router.post('/makepayment', function(req,res){
	var to= req.body.to;
	var email= req.body.email;
	var amount= req.body.amount;
	var password= req.body.password;

	info.findOne({email:email},function(err,user){
                if(err){
                        return res.status(200).json({"success":"false","info":"Email not registered"});
                }
                if(!user){
                        return res.status(200).json({"success":"false","info":"Email not registered"});
                }
                wall.findOne({_userId: user._id},function(err,wallet){
                        bcrypt.compare(password, wallet.wallet_pass, function(err, isMatch){
                                console.log("Here it is");
                                if(err) throw err;
                                if(isMatch){
                                        var data = JSON.stringify({
                                                api_code: 'cd0ebd41-3673-4096-8698-fdf738dbdf2e',
                                                amount: amount,
						from: 0,
						to: to,
						//from: wallet.xpub_add,
                                                password: password
                                        });
                                        var options = {
                                                host: 'localhost',
                                                port: 3030,
                                                path: '/merchant/'+wallet.guid+'/payment',
                                                method: 'POST',
                                                headers: {
                                                        'Content-Type': 'application/json'
                                                }
                                        };
					console.log(options.path);
                                        var req = http.request(options, function(response) {
                                                response.setEncoding('utf8');
                                                response.on('data', function (chunk) {
                                                        chunk = JSON.parse(chunk);
							console.log(chunk);
                                                        res.status(200).json({"msg":chunk});
                                                });
                                        });
                                        req.write(data);
					req.end();
				}
			});
		});
	});
});



module.exports= router;
