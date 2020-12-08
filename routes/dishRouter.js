const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.all((req,res,next)=>{
    res.statusCode = 200
    res.setHeader('Content-Type','text/plain')
    next();
})
.get((req,res,next)=>{
    res.end(`will send all dishes to you`);
})
.post((req,res,next)=>{
    res.end('will add new dish '+req.body.name +' with detail '+ req.body.description);
})
.put((req,res,next)=>{
    res.statusCode = 403
    res.end('put operation not allowed');
})
.delete((req,res,next)=>{
    res.end('will delete all the items');
});

dishRouter.route('/:dishId')
.all((req,res,next)=>{
    res.statusCode = 200
    res.setHeader('Content-Type','text/plain')
    next();
})
.get((req,res,next)=>{
    res.end(`will send ${req.params.dishId} dsih to you`);
})
.post((req,res,next)=>{
    res.statusCode = 403
    res.end('operation not allowed');
})
.put((req,res,next)=>{
    res.write('updating dish '+ req.params.dishId)
    res.end(`updating details dish name ${req.body.name} and detail ${req.body.description}`);
})
.delete((req,res,next)=>{
    res.end("deleting dish"+req.params.dishId);
})
module.exports = dishRouter;
