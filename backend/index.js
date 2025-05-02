const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const port = 4000; // ✅ Porta është tashmë e deklaruar

app.use(express.json());
app.use(cors());

// Lidhja me MongoDB
mongoose.connect("mongodb+srv://kristinahyka5:Ecommerce@cluster0.ofbg7we.mongodb.net/e-commerce");

// Ruta bazë për testim
app.get("/", (req, res) => {
    res.send("Express app is running");
});

// Konfigurimi për ruajtjen e imazheve
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Shërbimi statik për imazhet
app.use('/images', express.static('upload/images'));

// Endpoint për ngarkimin e imazheve
app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: "No file uploaded." });
    }

    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

// Schema e produktit
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    avilable: {
        type: Boolean,
        default: true,
    }
});

// Endpoint për shtimin e produkteve
app.post('/addproduct', async (req, res) => {
    let lastProduct = await Product.findOne().sort({ id: -1 });
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

// Endpoint për fshirjen e produktit
app.post('/removeproduct', async (req, res) => {
    console.log("Po fshihet produkti me id:", req.body.id);
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed");
    res.json({
        success: true
    });
});

// Endpoint për marrjen e të gjitha produkteve
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
});

//Schema creating for User model
const Users = mongoose.model('Users',{
  name:{
    type:String,

  },
  email:{
    type:String, 
    unique:true,
  },
  password:{
    type:String,
  },
  cartData:{
    type:Object,
  },
  date:{
    type:Date,
    default:Date.now,
   }
  
})

//Creating endpoint for registering the User
app.post('/signup',async (req,res)=>{

  let check = await Users.findOne({email:req.body.email});
  if (check) {
    return res.status(400).json({success:false,errors:"Ekziston nje perdorues me kete email!"})
  }else{
    let cart ={};
    for (let i = 0; i < 300; i++) {
      cart[i]=0; 
    }
    const user = new Users({
      name:req.body.username,
      email:req.body.email,
      password:req.body.password,
      cartData:cart,
    })

    await user.save();

    const data = {
      user:{
        id:user.id
      }
    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})

  }
})
//Creating endpoint for User Login
app.post('/login',async(req,res) => {
   let user = await Users.findOne({email:req.body.email});
   if (user) {
      const passCompare = req.body.password === user.password;
      if (passCompare){
        const data = {
          user:{
            id:user.id
          }
        }
        const token = jwt.sign(data,'secret_ecom');
        res.json({success:true,token});
      }
      else{
        res.json({success:false,errors:"Pasword i gabuar!"});
      }
   }
   else{
    res.json({success:false,errors:"Email i gabuar!"});
   }
})





// Nisja e serverit
app.listen(port, (error) => {
    if (!error) {
        console.log("✅ Server running on port " + port);
    } else {
        console.log("❌ Error: " + error);
    }
});
