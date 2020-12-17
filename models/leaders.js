const mongoose = require('mongoose');
const schema = mongoose.Schema;

const leadSchema = new schema({
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
    designation: {
        type: String,
        required: true,
    },
    featured: {
        type: Boolean,
        default:false      
    },
    abbr : {
        type: String,
        default: ''
    }
},{timestamps:true}
);

var leaders = mongoose.model('leader',leadSchema);
module.exports = leaders;