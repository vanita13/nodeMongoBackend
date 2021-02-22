const mongoose = require('mongoose');
const schema = mongoose.Schema;

var cart = new schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    products:[{
        product : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'product',
        required:true
        },
        qnty:{
        type:Number,
        default : 1
        },
        // price:{
        //     type : Number,
        //     require : true
        // }
        
    }],

},{timestamps:true});

module.exports = mongoose.model('Cart',cart);