const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // ngarkon .env

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Lidhja me MongoDB
mongoose.connect("mongodb+srv://kristinahyka5:Ecommerce@cluster0.ofbg7we.mongodb.net/e-commerce");

// Ruta testuese
app.get("/", (req, res) => {
  res.send("Express app is running");
});

// Konfigurimi i ruajtjes së imazheve
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });
app.use('/images', express.static('upload/images'));

// Endpoint për ngarkim imazhi
app.post("/upload", upload.single('product'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded." });
  }

  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});

// Schema e produktit me description dhe shades
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  description: { type: String, required: false },
  shades: { type: [String], required: false },
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true }
});

// Shto produkt
app.post('/addproduct', async (req, res) => {
  let lastProduct = await Product.findOne().sort({ id: -1 });
  let id = lastProduct ? lastProduct.id + 1 : 1;

  const shadesArray = req.body.shades
    ? req.body.shades.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const product = new Product({
    id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
    description: req.body.description || "",
    shades: shadesArray,
    avilable: req.body.avilable !== undefined ? req.body.avilable : true
  });

  try {
    await product.save();
    console.log("Produkti u ruajt:", product);
    res.json({ success: true, name: req.body.name });
  } catch (err) {
    console.error("Gabim:", err);
    res.status(500).json({ success: false, message: "Product not saved", error: err.message });
  }
});

// Fshi produkt
app.post('/removeproduct', async (req, res) => {
  console.log("Po fshihet produkti me id:", req.body.id);
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Produkti u fshi");
  res.json({ success: true });
});

// Merr të gjitha produktet
app.get('/allproducts', async (req, res) => {
  let products = await Product.find({});
  console.log("Të gjitha produktet u morën");
  res.send(products);
});

// Endpoint për të marrë të gjitha porositë
app.get('/allorders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Gabim në marrjen e porosive:", err);
    res.status(500).json({ success: false, message: "Gabim gjatë marrjes së porosive", error: err.message });
  }
});

// Schema për përdorues
const Users = mongoose.model('Users', {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { type: Object },
  date: { type: Date, default: Date.now }
});

// Regjistro përdorues
app.post('/signup', async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: "Ekziston një përdorues me këtë email!" });
  }

  let cart = {};

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart
  });

  await user.save();
  const data = { user: { id: user.id } };
  const token = jwt.sign(data, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

// Login përdorues
// Login përdorues me rikthim të karrocës
app.post('/login', async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = { user: { id: user.id } };
      const token = jwt.sign(data, process.env.JWT_SECRET);


      res.json({
        success: true,
        token: token,
        cartData: user.cartData // Rikthimi i karrocës
      });
    } else {
      res.json({ success: false, errors: "Fjalëkalimi i gabuar!" });
    }
  } else {
    res.json({ success: false, errors: "Email i gabuar!" });
  }
});


// Koleksioni i ri
app.get('/newcollections', async (req, res) => {
  let new_collection = await Product.find({}).sort({ date: -1 }).limit(8);
  console.log("Koleksioni i Ri!");
  res.send(new_collection);
});

// Më të shiturat për fytyrën
app.get('/popularinface', async (req, res) => {
  let products = await Product.find({ category: "face" });
  let popular_in_face = products.slice(0, 4);
  console.log("Më të shiturat për fytyrën");
  res.send(popular_in_face);
});

//creating middleware to fetch user
   const fetchUser = async (req,res,next)=> {
       const token = req.header('auth-token');
       if(!token) {
        res.status(401).send({erros:"JU LUTEM PERDORNI TOKEN TE VLEFSHME!"})
       }
       else{
        try {
          const data = jwt.verify(token, process.env.JWT_SECRET);
          req.user = data.user;
          next();
        } catch (error) {
          res.status(401).send({errors:"JU LUTEM PERDORNI TOKEN TE VELFSHEM"})
        }
       }
   }

// Shto në cart (placeholder)
app.post('/addtocart', fetchUser, async (req, res) => {
  try {
    let userData = await Users.findOne({ _id: req.user.id });

    // Kontrollo që produkti të ekzistojë
    let product = await Product.findOne({ id: req.body.itemId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found!" });
    }

    // Shto 1 për produktin në cartData
    if (userData.cartData[req.body.itemId]) {
      userData.cartData[req.body.itemId] += 1;
    } else {
      userData.cartData[req.body.itemId] = 1;
    }

    // Përditëso cartData në bazën e të dhënave për përdoruesin
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });

    res.json({ success: true, message: "Product added to cart!" });
  } catch (err) {
    console.error("❌ Gabim:", err);
    res.status(500).json({ success: false, message: "Error adding to cart", error: err.message });
  }
});
//creating endpoint to remove product from cart data
// Endpoint për heqjen e produktit nga cartData
app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
    let userData = await Users.findOne({ _id: req.user.id });

    // Kontrollo që produkti të ekzistojë
    let product = await Product.findOne({ id: req.body.itemId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found!" });
    }

    // Kontrollo nëse produkti është në cartData dhe hiq 1 nga sasia
    if (userData.cartData[req.body.itemId] > 0) {
      userData.cartData[req.body.itemId] -= 1;
      
      // Nëse sasia bëhet 0, heq produktin nga cartData
      if (userData.cartData[req.body.itemId] === 0) {
        delete userData.cartData[req.body.itemId];
      }
    } else {
      return res.status(400).json({ success: false, message: "Product not in cart!" });
    }

    // Përditëso cartData në bazën e të dhënave për përdoruesin
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });

    res.json({ success: true, message: "Product removed from cart!" });
  } catch (err) {
    console.error("❌ Gabim:", err);
    res.status(500).json({ success: false, message: "Error removing product from cart", error: err.message });
  }
});

//creating endpoint to get carData
app.post('/getcart',fetchUser,async (req,res)=>{
  console.log("GetCart");
  let userData = await Users.findOne({_id:req.user.id});
  res.json(userData.cartData);

})
// Endpoint për checkout / ruajtje të porosisë
const Order = mongoose.model("Order", {
  name: String,
  address: String,
  email: String,
  phone: String,
  cartItems: [
    {
      productId: String,       
      productName: String,    
      quantity: Number,
      shade: String
    }
  ],
  totalAmount: Number,
  date: { type: Date, default: Date.now },
});


app.post('/checkout', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    console.log("✅ Porosia u ruajt:", order);
    res.json({ success: true, message: "Porosia u ruajt me sukses!" });
  } catch (err) {
    console.error("❌ Gabim në ruajtjen e porosisë:", err);
    res.status(500).json({ success: false, message: "Gabim gjatë ruajtjes së porosisë", error: err.message });
  }
});

//my orders
app.get('/myorders', fetchUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Failed to get orders", error: err.message });
  }
});
// Nis serverin
app.listen(port, (error) => {
  if (!error) {
    console.log("Server running on port " + port);
  } else {
    console.log("Error: " + error);
  }
});
