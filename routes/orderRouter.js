const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Order = require('../models/order');
var authenticate = require('../authenticate');
const cors = require('./cors');
const cart = require('../models/cart');

const orderRouter = express.Router();

orderRouter.use(bodyParser.json());

orderRouter.route('/')
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    //rertreive all orders of specific user
    Order.find({"user" : req.user._id})
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
        user : req.user._id,
        totalAmt: req.body.totalAmt

    })
    if(req.body.paymentMethod)
    {
        order.paymentMethod = req.body.paymentMethod
    }
    order.save()
    .then((order)=>{
        cart.findOneAndRemove({_id:req.body.cart})
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(order)
    },(err)=>{next(err);})
    .catch((err)=>{next(err);});

    
}) //order save
.put() //only admins
.delete() //only admins 

module.exports = orderRouter;