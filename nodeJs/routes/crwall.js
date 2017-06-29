var express= require('express');
var mongoose= require('mongoose');
var router= express.Router();
var http= require('http');
var bcrypt= require('bcrypt');
var info= require('../models/usertry');
var wall= require('../models/createwallet');

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
						return res.status(200).json({"success":"true","info":"Pin successfully changed"});
					});
				});
			});
		}
		if(!user.walletCreated){
			return res.status(200).json({"success":"false","info":"please login successfully once"});
		}
	});
	/*var data = JSON.stringify({
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

	var req = http.request(options, function(res) {
    		res.setEncoding('utf8');
    		res.on('data', function (chunk) {
			chunk = JSON.parse(chunk);
        		var guid= chunk.guid;
			var add= chunk.address;
			//console.log(guid+"\n"+add);
			//console.log(rguid + "\n" + radd);
			var newWall= new wall({
				_userId: user._id,
				pin: pin,
				wallet_pass: password,
				guid: guid,
				xpub_add: add
			});
			bcrypt.genSalt(10, function(err,salt){
         			if(err){
  	                		console.log("Error in Encryption");
0                     			console.log(err);
           		}
          		bcrypt.hash(newWall.wallet_pass,salt,function(err,hash){
                    		if(err){
                 			console.log("Error in Hashing");
                    	        	console.log(err);
                      		}
            	   		newWall.wallet_pass= hash;
				bcrypt.genSalt(10, function(err,salt){
                			if(err){
                        			console.log("Error in Encryption");
                        			console.log(err);
                			}
                			bcrypt.hash(newWall.pin,salt,function(err,phash){
                        			if(err){
                                			console.log("Error in Hashing");
                                			console.log(err);
                       		 		}
                        			newWall.pin= phash;
						console.log(newWall.wallet_pass+ "\n"+ newWall.pin);
						newWall.save(function(err){
                					if(err){
								console.log("Error in Saving");
								console.log(err);
                        					//return res.status(503).json({"success":"false","info":"Server down"});
                					}
                					//res.status(200).json({"success":"true","info":"Wallet successfully create"});
                					console.log("Wallet created");
        					});
                			});
        			});
			});
			});
		});
	});
	req.write(data);
        req.end();
	
	});*/
});

module.exports= router;
