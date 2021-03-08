const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
var authenticate = require('../authenticate');
const cors = require('./cors');
const cart = require('../models/cart');
const { ExpectationFailed } = require('http-errors');
const products = require('../models/product');

const orderRouter = express.Router();

orderRouter.use(bodyParser.json());

orderRouter.route('/')
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    //rertreive all orders of specific user
    Order.find({"user" : req.user._id})
    .populate('products.product')
    .populate('user')
    .then((orders)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(orders);
    },(err)=>{next(err);})
    .catch((err)=>{next(err);});
}) 
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    
    cart.findOne({_id:req.body.cart})
    .populate('cart')
    .then((resp)=>{
        const order = new Order({
            cart : req.body.cart,
            user : req.user._id,
            totalAmt: req.body.totalAmt,
            products : resp.products
        });
        
        if(req.body.paymentMethod)
        {
            order.paymentMethod = req.body.paymentMethod
        }
        //update instock value in product collection 
        resp.products.forEach(products => {
        Product.findOne({_id:products.product}).exec().then((product)=>{
            
                product.inStock = product.inStock - products.qnty;
                product.save()
            }
        ,(err)=>next(err))
        .catch((err)=>next(err));
    });
        //save order
        order.save()
        .then((order)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(order)
        },(err)=>{next(err);
        })
            
        .catch((err)=>{next(err);});
    
    },(err)=>next(err))
    .catch((err)=>next(err));
    
}) //order save
.put() //only admins
.delete() //only admins 

module.exports = orderRouter;