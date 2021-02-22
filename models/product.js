const mongoose = require('mongoose');
const schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const commentSchema = new schema({
    rating:{
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment :{
        type: String,
        required: true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{
    timestamps:true
})

const productSchema = new schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    inStock : {
        type: Number,
        required: true,
    },
    comments:[commentSchema]
}, {
    timestamps: true
});

var products = mongoose.model('product',productSchema);
module.exports = products;