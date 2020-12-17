const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Leaders = require('../models/leaders');

const leadRouter = express.Router();

leadRouter.use(bodyParser.json());

leadRouter.route('/')
.get((req,res,next)=>{
    Leaders.find({})
    .then((leaders)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leaders);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    Leaders.create(req.body)
    .then((leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put((req,res,next)=>{
    res.statusCode = 403
    res.end('put operation not allowed');
})
.delete((req,res,next)=>{
    Leaders.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

leadRouter.route('/:leadId')
.get((req,res,next)=>{
    Leaders.findById(req.params.leadId)
    .then((leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    res.statusCode = 403
    res.end('operation not allowed');
})
.put((req,res,next)=>{
    Leaders.findByIdAndUpdate(req.params.leadId,{
        $set : req.body},
        {new:true}
    )
    .then((leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete((req,res,next)=>{
    Leaders.findByIdAndRemove(req.params.leadId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

module.exports = leadRouter;
