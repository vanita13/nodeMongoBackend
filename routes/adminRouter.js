const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const Order      = require('../models/order');
const Product    = require('../models/product');
const User       = require('../models/user');
const Cart       = require('../models/cart');
var authenticate = require('../authenticate');
const cors       = require('./cors');

const adminRouter = express.Router();

adminRouter.use(bodyParser.json());

adminRouter.route('/users')
.get(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,function(req, res, next) {
    User.find({})
    .populate('user')
    .then((users)=>{
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json(users);
      },(err)=>{next(err);})
      .catch((err)=>{next(err)
    })
  });
  adminRouter.route('/orders')
  .get(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
      Order.find({})
      .populate("cart")
      .populate("user")
      .then((orders)=>{
        
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(orders);
        },(err)=>{next(err);})
        .catch((err)=>{next(err);
          
      });
  })
  .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
      Order.findOne()//order id can be send in params or body after that update infoo..
  });

  adminRouter.route('/orders/:orderId')
  .get(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Order.findOne({_id:req.params.orderId})
    .populate('cart','user')
    .then((order)=>{
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json(order);
    },(err)=>{next(err);})
    .catch((err)=>{next(err);});
  })
  .post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode = 403;
    res.end('post operation not allowed');
  })
  .put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    
    Order.findById(req.params.orderId)
    .then((order)=>{
      if(req.body.delivered){
        order.delivered = req.body.delivered;
      }
      if(req.body.payment){
        order.payment = req.body.payment;
      }
      order.save()
      .then((order)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(order);
      },(err)=>{next(err);})
      .catch((err)=>{next(err);});
      },(err)=>next(err))
    .catch((err)=>next(err));
  });


  module.exports = adminRouter;


