var express= require('express');
var mongoose= require('mongoose');
var bodyParser= require('body-parser');
var expressValid= require('express-validator');
var bcrypt= require('bcrypt');
var passport= require('passport');
mongoose.Promise=global.Promise;
var app= express();
var session= require('express-session');
var flash= require('connect-flash');
var config= require('./config/database');
var cors= require('cors');

app.use(cors());

app.use(flash());
//For Mail Verification
//var nev = require('email-verification')(mongoose);

//For Validating the Express Code
app.use(expressValid());

//Bring the Models
var info= require('./models/usertry');

mongoose.connect(config.database);
var db= mongoose.connection;

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({extended:false}));
 
// parse application/json 
app.use(bodyParser.json());

//Check for DataBase Error
db.on ('error',function(err){
	console.log(err);
});

//Checking for DataBase running Successfully
db.once('open',function(){
	console.log('Connected to MongoDb');
});

//For Passport Config
require('./config/passport')(passport);

//Passport MiddleWare
app.use(passport.initialize());
//app.use(passport.session());

//To add for Homepage
app.get('/',function(req,res){
	res.send("This is a Home Page");
});

var surf= require('./routes/surftry');
app.use("/",surf);


var wal_id= require('./routes/crwall');
app.use("/",wal_id);

//app.use('/confirmation', surf.confirmationPost);
//app.use('/resend', surf.resendTokenPost);

//Staring the Server
app.listen(8010,function(req,res){
//res.send('Mofos here');
console.log('Server Running at 139.59.78.201:8010');
});
