const mongoose = require('mongoose');
const schema = mongoose.Schema;

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
        type: Number,
        required: true,
        min: 0
    },
    inStock : {
        type: Number,
        required: true,
    },
    comments:[commentSchema],
    priceArray : [{
        name:{type:String,default:'previous'},
        amt:{type:Number,required:true}
    }]
}, {
    timestamps: true
});

var products = mongoose.model('product',productSchema);
module.exports = products;