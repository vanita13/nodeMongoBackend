const mongoose = require('mongoose');
const schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new schema({
    name:{
        type:String,
        required:true,

    },
    username:{
        type : String,
    },
    password:{
        type:String
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
    },
    passwordResetToken :{
        type:String
    },
    passwordExpires : Date
    
});
User.plugin(passportLocalMongoose);

// User.pre('save', function(next) {
//     var user = this;
//     var SALT_FACTOR = 12;
  
//     if (!user.isModified('password')) return next();
//     console.log(user.password);
  
//     bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
//       if (err) return next(err);
  
//       bcrypt.hash(user.password, salt, null, function(err, hash) {
//         if (err) return next(err);
//         user.salt = salt;
//         user.hash = hash;
//         user.password = salt;
//         next();
//       });
//     });
//   });
module.exports = mongoose.model('User',User);