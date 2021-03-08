require('dotenv').config()
const formidable=require('formidable')
const express=require('express')
const router=express.Router()
const https=require('https')
const checksum_lib = require('./checksum.js');
const PaytmChecksum = require('./PaytmChecksum.js');
var Order = require('../models/order');
var cart = require('../models/cart');
var Product = require('../models/product');



router.post('/callback',(req,res)=>
{

var paytmChecksum = "";
    var received_data = req.body;
    
    var paytmParams = {};
    for(var key in received_data){
        if(key == "CHECKSUMHASH") {
            paytmChecksum = received_data[key];
        } else {
            paytmParams[key] = received_data[key];
        }
    }

    var isValidChecksum = checksum_lib.verifychecksum(paytmParams, process.env.MERCHANT_KEY, paytmChecksum);
    //MITM ATTACK HAS BEEN DONE OR NOT
    if(isValidChecksum) {
        console.log("Checksum Matched");
        /*
        * import checksum generation utility
        * You can get this utility from https://developer.paytm.com/docs/checksum/
        */

        var paytmParams = {};
        paytmParams["MID"]     = received_data['MID'];
        paytmParams["ORDERID"] = received_data['ORDERID'];

        /*
        * Generate checksum by parameters we have
        * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
        */
        PaytmChecksum.generateSignature(paytmParams,process.env.MERCHANT_KEY).then(function(checksum){

            paytmParams["CHECKSUMHASH"] = checksum;

            var post_data = JSON.stringify(paytmParams);

            var options = {

                /* for Staging */
                hostname: 'securegw-stage.paytm.in',

                /* for Production */
                // hostname: 'securegw.paytm.in',

                port: 443,
                path: '/order/status',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };

            var response = "";
            var post_req = https.request(options, function(post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });

                post_res.on('end', function(){
                    console.log('Response: ', response);
                    res.json(JSON.parse(response))
                });
            });
    cart.findOne({_id:post_data.ORDERID})
    .populate('cart')
    .then((resp)=>{
        const order = new Order({
            cart : post_data.ORDERID,
            user : paytmParams['CUST_ID'],
            totalAmt: post_data.TXNAMOUNT,
            products : resp.products,
            paymentMethod: post_data.PAYMENTMETHOD
        });
        
        // if(req.body.paymentMethod)
        // {
        //     order.paymentMethod = req.body.paymentMethod
        // }
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
            req.flash({order:order,msg:post_data.RESPMSG});
            return res.redirect('order')
        },(err)=>{next(err);
        })
            
        .catch((err)=>{next(err);});
    
    },(err)=>next(err))
    .catch((err)=>next(err));
            post_req.write(post_data);
            post_req.end();
        });        
        
        
    } else {
        console.log("Checksum Mismatched");
        res.json({
            "MESSAGE":"STOP MESSING AROUND WITH GATEWAY"
        })
    }

})

router.post('/payment',(req,res)=>
{


const{user,cart,amount,email}=req.body;

    /* import checksum generation utility */
const totalAmount=JSON.stringify(amount);
var params = {};

/* initialize an array */
    params['MID'] = "ObJOcR21595844550347",
        params['WEBSITE'] = "WEBSTAGING",
        params['CHANNEL_ID'] = "WEB",
        params['INDUSTRY_TYPE_ID'] = "Retail",
        params['ORDER_ID'] = cart,
        params['CUST_ID'] = user,
        params['TXN_AMOUNT'] = totalAmount,
        params['CALLBACK_URL'] = 'https://localhost:3443/api/callback',
        params['EMAIL'] = email,
        params['MOBILE_NO'] = '+917777777777';

/**
* Generate checksum by parameters we have
* Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
*/
var paytmChecksum = PaytmChecksum.generateSignature(params,process.env.MERCHANT_KEY);
paytmChecksum.then(function(checksum){
    let paytmParams={
        ...params,
        "CHECKSUMHASH":checksum
    }
    res.json(paytmParams)
}).catch(function(error){
	console.log(error);
});

})

module.exports=router;