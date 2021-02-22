const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Order = require('../models/order');
var authenticate = require('../authenticate');
const cors = require('./cors');

const orderRouter = express.Router();

orderRouter.use(bodyParser.json());

orderRouter.route('/')
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    //rertreive all orders of specific user
    Order.findOne({"user" : req.user._id})
    .populate('cart')
    .populate('user')
    .then((orders)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(orders);
    },(err)=>{next(err);})
    .catch((err)=>{next(err);});
}) 
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    const order = new Order({
        cart : req.body.cart,
        user : req.user._id

    })
    order.save()
    .then((order)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(order)
    },(err)=>{next(err);})
    .catch((err)=>{next(err);});
}) //order save
.put() //only admins
.delete() //only admins 

module.exports = orderRouter;