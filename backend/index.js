const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Test route
app.get("/", (req, res) => {
  res.send("Express app is running");
});

// Image storage configuration
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });
app.use('/images', express.static('upload/images'));

// Image upload endpoint
app.post("/upload", upload.single('product'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded." });
  }

  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});

// Product schema with description and shades
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
  available: { type: Boolean, default: true } // Fixed typo from 'avilable' to 'available'
});

// Add product
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
    available: req.body.available !== undefined ? req.body.available : true
  });

  try {
    await product.save();
    console.log("Product saved:", product);
    res.json({ success: true, name: req.body.name });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, message: "Product not saved", error: err.message });
  }
});

// Remove product
app.post('/removeproduct', async (req, res) => {
  console.log("Removing product with id:", req.body.id);
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Product removed");
  res.json({ success: true });
});

// Get all products
app.get('/allproducts', async (req, res) => {
  let products = await Product.find({});
  console.log("All products fetched");
  res.send(products);
});

// User schema
const Users = mongoose.model('Users', {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: {
    type: Map,
    of: new mongoose.Schema({
      quantity: Number,
      shade: String
    }),
    default: {}
  },
  date: { type: Date, default: Date.now }
});

// Order schema
const Order = mongoose.model("Order", {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, // Added userId reference
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

// Get all orders
app.get('/allorders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Error fetching orders", error: err.message });
  }
});

// User registration
app.post('/signup', async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: "A user with this email already exists!" });
  }

  let cart = {};
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    cartData: cart
  });

  await user.save();
  const data = { user: { id: user.id } };
  const token = jwt.sign(data, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

// User login
app.post('/login', async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = await bcrypt.compare(req.body.password, user.password);
    if (passCompare) {
      const data = { user: { id: user.id } };
      const token = jwt.sign(data, process.env.JWT_SECRET);

      res.json({
        success: true,
        token: token,
        cartData: user.cartData
      });
    } else {
      res.json({ success: false, errors: "Wrong password!" });
    }
  } else {
    res.json({ success: false, errors: "Wrong email!" });
  }
});

// New collections
app.get('/newcollections', async (req, res) => {
  let new_collection = await Product.find({}).sort({ date: -1 }).limit(8);
  console.log("New Collection!");
  res.send(new_collection);
});

// Popular in face
app.get('/popularinface', async (req, res) => {
  let products = await Product.find({ category: "face" });
  let popular_in_face = products.slice(0, 4);
  console.log("Popular in face");
  res.send(popular_in_face);
});

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send({ errors: "Please use a valid token!" });
  } else {
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({ errors: "Please use a valid token!" });
    }
  }
};

// Add to cart
app.post("/addtocart", fetchUser, async (req, res) => {
  try {
    const { productId, quantity = 1, shade = "" } = req.body;

    if (!productId) {
      return res.status(400).send({ message: "Missing productId in body!" });
    }

    const userData = await Users.findById(req.user.id);
    if (!userData) {
      return res.status(404).send({ message: "User not found!" });
    }

    if (!userData.cartData) {
      userData.cartData = new Map();
    }

    // Convert productId to string as Map keys are strings
    const productIdStr = productId.toString();

    if (!userData.cartData.get(productIdStr)) {
      userData.cartData.set(productIdStr, { quantity, shade });
    } else {
      const existingItem = userData.cartData.get(productIdStr);
      existingItem.quantity += quantity;
      userData.cartData.set(productIdStr, existingItem);
    }

    await userData.save();

    res.send({ message: "Product added to cart successfully!" });
  } catch (error) {
    console.error("❌ Error in /addtocart:", error.message);
    res.status(500).send({ message: "Internal server error!" });
  }
});

// Remove from cart
app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
    const { productId } = req.body;
    const userData = await Users.findById(req.user.id);

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // Convert productId to string as Map keys are strings
    const productIdStr = productId.toString();

    if (userData.cartData.get(productIdStr)) {
      const item = userData.cartData.get(productIdStr);
      item.quantity -= 1;
      
      if (item.quantity <= 0) {
        userData.cartData.delete(productIdStr);
      } else {
        userData.cartData.set(productIdStr, item);
      }

      await userData.save();
      return res.json({ success: true, message: "Product removed from cart!" });
    }
    
    return res.status(404).json({ success: false, message: "Product not found in cart!" });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Error removing product from cart", error: err.message });
  }
});

// Get cart
app.post('/getcart', fetchUser, async (req, res) => {
  console.log("GetCart");
  let userData = await Users.findById(req.user.id);
  
  // Convert Map to object for JSON response
  const cartData = {};
  userData.cartData.forEach((value, key) => {
    cartData[key] = value;
  });
  
  res.json(cartData);
});

// Checkout
app.post('/checkout', fetchUser, async (req, res) => {
  try {
    const orderData = req.body;
    orderData.userId = req.user.id; // Add userId to the order
    
    const order = new Order(orderData);
    await order.save();
    
    // Clear the user's cart after successful checkout
    const user = await Users.findById(req.user.id);
    user.cartData = new Map();
    await user.save();
    
    console.log("✅ Order saved:", order);
    res.json({ success: true, message: "Order saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving order:", err);
    res.status(500).json({ success: false, message: "Error saving order", error: err.message });
  }
});

// My orders
app.get('/myorders', fetchUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Failed to get orders", error: err.message });
  }
});

// Start server
app.listen(port, (error) => {
  if (!error) {
    console.log("Server running on port " + port);
  } else {
    console.log("Error: " + error);
  }
});