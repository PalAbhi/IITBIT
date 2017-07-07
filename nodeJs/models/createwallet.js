var mongoose= require("mongoose");
var crwallSchema = mongoose.Schema({
        _userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'memberinfos'
        },
	pin: {
		type: String,
		required: true
	},
	pinCreated: {
		type: Boolean,
		default: false
	},
	wallet_pass: {
		type: String,
		requires: true
	},
        guid: {
                type: String,
		required: true
	},
	/*rec_add:{
		type:String,
		required:true
	},*/
        xpub_add: {
                type: String,
                required: true
        }
});

module.exports= mongoose.model('createwallet',crwallSchema);
