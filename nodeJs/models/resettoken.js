var mongoose= require("mongoose");

var restoken= mongoose.Schema({
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
                expires: 180
        }
});

module.exports= mongoose.model('resettoken',restoken);
