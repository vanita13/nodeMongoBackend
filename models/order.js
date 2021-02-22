const mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderSchema = new schema({

    cart : {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Cart'
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    delivered:{
        type: Boolean,
        default:false
    },
    payment : {
        type:Boolean,
        default:false
    }

},{timestamps:true});

module.exports = mongoose.model('order',orderSchema);