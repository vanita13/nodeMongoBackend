const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.all((req,res,next)=>{
    res.statusCode = 200
    res.setHeader('Content-Type','text/plain')
    next();
})
.get((req,res,next)=>{
    res.end(`will send all promotions to you`);
})
.post((req,res,next)=>{
    res.end('will add new promotion '+req.body.name +' with detail '+ req.body.description);
})
.put((req,res,next)=>{
    res.statusCode = 403
    res.end('put operation not allowed');
})
.delete((req,res,next)=>{
    res.end('will delete all the promotions');
});

promoRouter.route('/:promoId')
.all((req,res,next)=>{
    res.statusCode = 200
    res.setHeader('Content-Type','text/plain')
    next();
})
.get((req,res,next)=>{
    res.end(`will send promotion ${req.params.promoId}  to you`);
})
.post((req,res,next)=>{
    res.statusCode = 403
    res.end('operation not allowed');
})
.put((req,res,next)=>{
    res.write('updating promotion '+ req.params.promoId)
    res.end(`updating  promotion name ${req.body.name} and detail ${req.body.description}`);
})
.delete((req,res,next)=>{
    res.end("deleting promotion "+req.params.promoId);
})
module.exports = promoRouter;
