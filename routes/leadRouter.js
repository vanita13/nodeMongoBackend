const express = require('express');
const bodyParser = require('body-parser');

const leadRouter = express.Router();

leadRouter.use(bodyParser.json());

leadRouter.route('/')
.all((req,res,next)=>{
    res.statusCode = 200
    res.setHeader('Content-Type','text/plain')
    next();
})
.get((req,res,next)=>{
    res.end(`will send all leaders to you`);
})
.post((req,res,next)=>{
    res.end('will add new leader '+req.body.name +' with detail '+ req.body.description);
})
.put((req,res,next)=>{
    res.statusCode = 403
    res.end('put operation not allowed');
})
.delete((req,res,next)=>{
    res.end('will delete all the leaders');
});

leadRouter.route('/:leadId')
.all((req,res,next)=>{
    res.statusCode = 200
    res.setHeader('Content-Type','text/plain')
    next();
})
.get((req,res,next)=>{
    res.end(`will send leader ${req.params.leadId}  to you`);
})
.post((req,res,next)=>{
    res.statusCode = 403
    res.end('operation not allowed');
})
.put((req,res,next)=>{
    res.write('updating leader '+ req.params.leadId)
    res.end(`updating  leader name ${req.body.name} and detail ${req.body.description}`);
})
.delete((req,res,next)=>{
    res.end("deleting leader "+req.params.leadId);
})
module.exports = leadRouter;
