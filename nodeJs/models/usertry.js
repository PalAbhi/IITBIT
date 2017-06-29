var mongoose= require('mongoose');

var infoSchema= mongoose.Schema({
	name:{
		type: String,
		required: true
	},
	email:{
		type: String,
		unique: true,
		required: true
	},
	dob:{
		type:Date,
		required: true
	},
	gender:{
		type: String,
		required: true
	},
	mobile:{
		type: Number,
		required: true
	},
	password:{
		type: String,
		required: true
	},
	isVerified:{
		type: Boolean,
		default: false
	},
	walletCreated:{
		type: Boolean,
		default: false
	}
});

var info= module.exports = mongoose.model('memberinfo',infoSchema);
