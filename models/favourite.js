const mongoose = require('mongoose');
const schema = mongoose.Schema;



const favSchema = new schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'product'
    }]
    
},{
    timestamps:true}
);

var favourites = mongoose.model('favourite',favSchema);
module.exports = favourites;