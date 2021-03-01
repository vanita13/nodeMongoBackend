const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const { json } = require('express');
const cors = require('./cors');
const Products = require('../models/product');
const fs = require('fs');
const Img = require('../models/image');

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/images');
    },
    filename: (req,file,cb)=>{
        cb(null,file.originalname);
    }
});

const imageFileFilter = (req,file,cb)=>{
    if(!file.originalname.match(/\.(png|jpg|jpeg|gif)$/)){
        cb(new Error('file not supported'),false);
    }
    else{
        cb(null,true);
    }
};

const upload = multer({ storage :storage,fileFilter:imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /productUpload');
})
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res,next) => {
    
    var newImg = new Img;
    newImg.img.data = fs.readFileSync(req.file.path);
    newImg.img.path = req.file.path
    newImg.save();
    
    var productInfo = req.body;
    if(!productInfo.name || !productInfo.description || !productInfo.category || !productInfo.price || !productInfo.inStock){
        res.render('show_message', {
            message: "Sorry, you provided worng info", type: "error"});
    }
    else{
        const newProduct = new Products({
            name : productInfo.name,
            description : productInfo.description,
            category : productInfo.category,
            price : productInfo.price,
            inStock : productInfo.inStock,
            image : 'images/'+ req.file.filename
        });
        newProduct.save()
        .then((product)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(req.file);
        },(err)=>next(err))
    .catch((err)=>next(err));
    }
    // res.json(req.file);
})
.put(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /productUpload');
})
.delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /productUpload');
});

uploadRouter.route('/:Id')
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,upload.single("imageFile"),(req,res,next)=>{
    Products.findByIdAndUpdate(req.params.Id, {
                $set: req.body,
                image : '/images/'+req.file.filename
            }, { new: true })
            .then((product) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(product);
            }, (err) => next(err))
            .catch((err) => next(err));
});


module.exports = uploadRouter;