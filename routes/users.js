var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/user');
var Token = require('../models/tokenSchema');
var authenticate = require('../authenticate');
const cors = require('./cors');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

var passport = require('passport');
const { use } = require('passport');

var router = express.Router();
router.use(bodyParser.json());
/* GET users listing. */
router.get('/',cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,function(req, res, next) {
  User.find({})
  .then((users)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json(users);
    },(err)=>{next(err);})
    .catch((err)=>{next(err)
  })
});

router.post('/signup',cors.corsWithOptions,function(req,res,next){
  
  
  User.register(new User({username: req.body.username,name:req.body.name,address:req.body.address,phone:req.body.phone,pin:req.body.pin}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      
        user.name = req.body.name;
        user.address = req.body.address;
        user.pin = req.body.pin;
        user.phone = req.body.phone;
        user.save((err,user)=>{
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
        token.save(function (err) {
          if (err) { return res.status(500).send({ msg: err.message }); }

          // Send the email
          var transporter = nodemailer.createTransport({ service: "Gmail", 
                  auth: { user: process.env.SENDGRID_USERNAME , 
                          pass: process.env.SENDGRID_PASSWORD } });
          var mailOptions = { from: process.env.SENDGRID_USERNAME,
                              to: user.username, 
                              subject: 'Account Verification Token', 
                              text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttps:\/\/' + req.headers.host + '\/users\/confirmation\/' + token.token + '.\n' };
          transporter.sendMail(mailOptions, function (err,next){
              if (err) { return res.status(500).send({ msg: err.message }); }
              res.status(200).send('A verification email has been sent to ' + user.username + '.');
              next(()=>{
                passport.authenticate('local')(req, res, () => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({success: true, status: 'Registration Successful!'});
                });
              })
            });
            
          });
          
          

      
      
    });
    }
  });

});
router.get('/confirmation/:token',cors.corsWithOptions,function (req, res, next) {
   // Find a matching token
  Token.findOne({ token: req.params.token }, function (err, token) {
    if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });

      // If we found a token, find a matching user
      User.findOne({ _id: token._userId }, function (err, user) {
          if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
          if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

          // Verify and save the user
          user.isVerified = true;
          user.save(function (err) {
              if (err) { return res.status(500).send({ msg: err.message }); }
              res.status(200).send("The account has been verified. Please log in.");
              
          });
      });
  });
});

router.post('/login',cors.corsWithOptions,passport.authenticate('local'),(req,res)=>{
  var token = authenticate.getToken({_id:req.user._id})
  if (!req.user.isVerified) return res.status(401).send({ type: 'not-verified', msg: 'Your account has not been verified.' }); 
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true,token:token, user:req.user ,status: 'You are successfully logged in!'});
    
});

router.post('/resend',cors.corsWithOptions,function (req, res, next) {
  req.sanitize('username').normalizeEmail({ remove_dots: false });

  User.findOne({ username: req.body.username }, function (err, user) {
      if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
      if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

      // Create a verification token, save it, and send email
      var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

      // Save the token
      token.save(function (err) {
          if (err) { return res.status(500).send({ msg: err.message }); }

          // Send the email
          var transporter = nodemailer.createTransport({ service: "Gmail", auth: { user: process.env.SENDGRID_USERNAME , 
                            pass: process.env.SENDGRID_PASSWORD } });
          var mailOptions = { from: process.env.SENDGRID_USERNAME, to: user.username, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
          transporter.sendMail(mailOptions, function (err) {
              if (err) { return res.status(500).send({ msg: err.message }); }
              res.status(200).send('A verification email has been sent to ' + user.username + '.');
          });
      });

  });
})
router.get('/logout', cors.corsWithOptions,(req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

router.get('/checkJWTToken',cors.corsWithOptions,(req,res,next)=>{
  passport.authenticate('jwt',{session:false},(err,user,info)=>{
    if(err){next(err);}
    if(!user){
      res.statusCode = 401;
      res.setHeader('Content-Type','application/json');
      res.json({status: 'JWT invalid',success:false,err: info});
    }
    else{
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json({ status: 'JWT valid', success: true , user : user});
    }
  })(req,res);
});

// router.post('/forgot', function(req, res, next) {
//   async.waterfall([
//     function(done) {
//       crypto.randomBytes(20, function(err, buf) {
//         var token = buf.toString('hex');
//         done(err, token);
//       });
//     },
//     function(token, done) {
//       User.findOne({ username: req.body.username }, function(err, user) {
//         if (!user) {
//         //   console.log('error', 'No account with that email address exists.');
//         req.flash('error', 'No account with that email address exists.');
//           return res.redirect('/forgot');
//         }
// console.log('step 1')
//         user.resetPasswordToken = token;
//         user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

//         user.save(function(err) {
//           done(err, token, user);
//         });
//       });
//     },
//     function(token, user, done) {
//         console.log('step 2')


//       var smtpTrans = nodemailer.createTransport({
//          service: 'Gmail', 
//          auth: {
//           user: process.env.SENDGRID_USERNAME,
//           pass: process.env.SENDGRID_PASSWORD
//         }
//       });
//       var mailOptions = {

//         to: user.username,
//         from: process.env.SENDGRID_USERNAME,
//         subject: 'Node.js Password Reset',
//         text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
//           'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//           'http://' + req.headers.host + '/reset/' + token + '\n\n' +
//           'If you did not request this, please ignore this email and your password will remain unchanged.\n'

//       };
//       console.log('step 3')

//         smtpTrans.sendMail(mailOptions, function(err) {
//         req.flash('success', 'An e-mail has been sent to ' + user.username + ' with further instructions.');
//         console.log('sent')
//         res.redirect('/forgot');
// });
// }
//   ], function(err) {
//     console.log('this err' + ' ' + err)
//     res.redirect('/');
//   });
// });

// router.get('/forgot', function(req, res) {
//   res.render('forgot', {
//     User: req.user
//   });
// });

// router.get('/reset/:token', function(req, res) {
//   User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
//       console.log(user);
//     if (!user) {
//       req.flash('error', 'Password reset token is invalid or has expired.');
//       return res.redirect('/forgot');
//     }
//     res.render('reset', {
//      User: req.user
//     });
//   });
// });

// app.post('/reset/:token', function(req, res) {
//   async.waterfall([
//     function(done) {
//       User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user, next) {
//         if (!user) {
//           req.flash('error', 'Password reset token is invalid or has expired.');
//           return res.redirect('back');
//         }


//         user.password = req.body.password;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;
//         console.log('password' + user.password  + 'and the user is' + user)

// user.save(function(err) {
//   if (err) {
//       console.log('here')
//        return res.redirect('back');
//   } else { 
//       console.log('here2')
//     req.logIn(user, function(err) {
//       done(err, user);
//     });

//   }
//         });
//       });
//     },





//     function(user, done) {
//         // console.log('got this far 4')
//       var smtpTrans = nodemailer.createTransport({
//         service: 'Gmail',
//         auth: {
//           user: process.env.SENDGRID_USERNAME,
//           pass: process.env.SENDGRID_PASSWORD
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: process.env.SENDGRID_USERNAME,
//         subject: 'Your password has been changed',
//         text: 'Hello,\n\n' +
//           ' - This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
//       };
//       smtpTrans.sendMail(mailOptions, function(err) {
//         // req.flash('success', 'Success! Your password has been changed.');
//         done(err);
//       });
//     }
//   ], function(err) {
//     res.redirect('/');
//   });
// });


module.exports = router;
