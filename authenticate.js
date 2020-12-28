var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var jwtStrategy = require('passport-jwt').Strategy;
var jwtExtract = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');
const { ExtractJwt } = require('passport-jwt');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user){
    return jwt.sign(user,config.secretKey,{expiresIn:3600});
};

var opts ={};
opts.jwtFromRequest = jwtExtract.fromAuthHeaderAsBearerToken();
opts.secertOrkey = config.secretKey;

exports.jwtPassport = passport.use(new jwtStrategy(opts,
    (jwtPayload,done)=>{
        console.log('jwt payload : '+ jwtPayload);
        User.findOne({_id:jwtPayload._id},(err,user)=>{
            if(err){
                return done(err,false);
            }
            else if(user){
                return done(null,user);
            }
            else{
                return done(null,false)
            }
        });
    }
));

exports.verifyUser = passport.authenticate('jwt', {session: false});