const mongoose = require('mongoose');
const schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new schema({
    name:{
        type:String,
        required:true,

    },
    admin:{
        type:Boolean,
        default:false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    address:{
        type:String,
        required:true
    },
    pin : {
      type : Number,
      required : true
    },
    phone : {
      type : Number,
      required : true
    }
    // passwordResetToken :{
    //     type:String
    // },
    // passwordExpires : Date
    
});
User.plugin(passportLocalMongoose);

User.pre('save', function(next) {
    var user = this;
    var SALT_FACTOR = 5;
  
    if (!user.isModified('password')) return next();
  
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
      if (err) return next(err);
  
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  });
module.exports = mongoose.model('User',User);