const mongoose = require('mongoose');
const schema = mongoose.Schema;



const favSchema = new schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    dishes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'dish'
    }]
    
},{
    timestamps:true}
);

var favourites = mongoose.model('favourite',favSchema);
module.exports = favourites;