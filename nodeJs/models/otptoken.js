var mongoose= require("mongoose");

var otptoken= mongoose.Schema({
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
                expires: 300
        }
});

module.exports= mongoose.model('otptoken',otptoken);
