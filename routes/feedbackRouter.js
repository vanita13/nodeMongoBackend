const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const Feedback = require('../models/feedback');
const User = require('../models/user');
var authenticate = require('../authenticate');
const cors = require('./cors');

const feedbackRouter = express.Router();

feedbackRouter.use(bodyParser.json());

feedbackRouter.route('/')
.get(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Feedback.find({})
    .then((feedbacks)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(feedbacks);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Feedback.create(req.body)
    .then((feedback)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(feedback);
    },(err)=>next(err))
    .catch((err)=>next(err));
    
});

module.exports = feedbackRouter;