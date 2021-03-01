const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Cart = require('../models/cart');
var authenticate = require('../authenticate');
const cors = require('./cors');
const { ExpectationFailed } = require('http-errors');
const products = require('../models/product');

const cartRouter = express.Router();

cartRouter.use(bodyParser.json());

cartRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Cart.findOne({user : req.user._id})
    .populate('products.product')
    .then((products)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(products);
    },(err)=>{next(err);})
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    //check if cart already exits then update the cart
        Cart.findOne({user:req.user._id})
        .then((cart,err)=>{
            if(err){ res.status(400).json(err);}
    
            if(cart){
                Cart.findOneAndUpdate({user:req.user._id},{
                                   "$push":{
                                    "products":req.body.products
                                    }})
                .then((product)=>{
                        res.status(200);
                        res.json(product);
                       },(err)=>{next(err);})
                .catch((err)=>{next(err)});
                    
                }
            else{
                //cart doesn't exits then create a new cart for the user
                const cart = new Cart({
                    user: req.user._id,
                    products : [req.body.products]
                })
                cart.save((err,cart)=>{
                    if(err) return res.status(400).json({err});
                    if(cart) return res.status(200).json({cart});
                });
    
            }
        })
    
        
    })
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end('put operation not allowed');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Cart.delete({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>{next(err);})
    .catch((err)=>{next(err);})
});


cartRouter.route('/:productId')
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    res.statusCode = 403;
    res.end("get operation not allowed");
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{






     Cart.findOne({user:req.user._id})
     .then((cart)=>{
        //const productExists = cart.products.find(c=>c.product == req.params.productId);
        // const indexFound = cart.products.findIndex(c=>c.product == req.params.productId);
        // if(indexFound !== -1 && productExists.qnty <= 0){
        //      cart.products.splice(indexFound,1);
        //      Cart.findOneAndUpdate({user:req.user._id},{
        //                 "$pull":{
        //                 "products":{product : req.params.productId}
        //                 }}).exec();
        //             cart.save();
        //             res.status(200);
        //             res.json(cart);
        //             }
        //else{       
               const item = cart.products.find(c=>c.product == req.params.productId);
                if(item){
                            Cart.findOneAndUpdate({"user":req.user._id,"products.product":req.params.productId},{
                                "$set":{
                                    "products.$":{
                                        product:req.params.productId,
                                        qnty :  req.body.qnty
                                    }
                                   
                                }
                            }).exec()
                            .then((product)=>{
                                product.save();
                                res.status(200);
                                res.json(product);
                            },(err)=>{next(err);})
                            .catch((err)=>{next(err)});
                
                        }
                    },(err)=>{next(err);})
                    .catch((err)=>{next(err);});
                 }
 )
.delete(cors.corsWithOptions,authenticate.verifyUser,(req,res,next)=>{
    Cart.findOneAndUpdate({user:req.user._id},{
        "$pull":{
        "products":{product : req.params.productId}
        }}).exec()
    .then((cart)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(cart);
    },(err)=>{next(err);})
    .catch((err)=>{next(err);});
    

});
module.exports = cartRouter;