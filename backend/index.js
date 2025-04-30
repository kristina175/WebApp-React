const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

//database connection with mongodb
mongoose.connect("mongodb+srv://kristinahyka5:Ecommerce@cluster0.ofbg7we.mongodb.net/e-commerce")

// api creation

app.get("/",(req,res) => {
    res.send("express app is running")


})

//image storage engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
      return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
  });

const upload = multer({storage:storage})

//crateing  upload endpoint for images
app.use('/images',express.static('upload/images'))
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: 0, message: "No file uploaded." });
    }
  
    res.json({
      success: 1,
      image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
  });
  
//schema for creating products
const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,

    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    avilable: { type: Boolean, default: true }
})

app.post('/addproduct', async (req, res) => {
    // Merr produktin e fundit sipas id-së
    let lastProduct = await Product.findOne().sort({ id: -1 });
  
    // Inkremento id në bazë të produktit të fundit, ose fillo me 1
    let id = lastProduct ? lastProduct.id + 1 : 1;
  
    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      avilable: req.body.avilable !== undefined ? req.body.avilable : true
    });
  
    try {
      await product.save();
      console.log("Saved:", product);
      res.json({
        success: true,
        name: req.body.name,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Product not saved", error: err.message });
    }
  });

  //crateing api for deleting products

app.get('/removeproduct',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

//creating api for getting all products
app.get('/allproducts', async(req,res) =>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

app.listen(port,(error) => {
    if(!error) {
        console.log("Server running on port" +port)
    }else{
        console.log("error: " +error)
    }

})
