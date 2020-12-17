const mongoose = require('mongoose');
const schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promoSchema = new schema({
    name :{
        type: String,
        required: true,
        unique: true
    },
    image :{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default:false      
    },
    label: {
        type: String,
        default: ''
    }
},{timestamps:true}
);

var promotions = mongoose.model('promotion',promoSchema);
module.exports = promotions;