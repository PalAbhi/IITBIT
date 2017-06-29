var mongoose= require("mongoose");
var authSchema = mongoose.Schema({
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
                expires: 10800
        }
});

module.exports= mongoose.model('authtoken',authSchema);
