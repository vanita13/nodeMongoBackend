const mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderSchema = new schema({

    cart : {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Cart'
    },
    totalAmt:{
        type : Number,
        required:true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    paymentMethod:{
        type:String,
        default:'cod'
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