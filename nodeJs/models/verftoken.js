var mongoose= require("mongoose");
var tokenSchema = mongoose.Schema({
    	_userId: { 
		type: mongoose.Schema.Types.ObjectId, 
		required: true, 
		ref: 'memberinfos' 
	},
    	token: { 
		type: String, 
		required: true 
	},
    	createdAt: { 
		type: Date, 
		required: true, 
		default: Date.now, 
		expires: 43200 
	}
});

module.exports= mongoose.model('tokenverf',tokenSchema);
