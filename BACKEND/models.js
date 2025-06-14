const mongoose = require('mongoose');

// Connect to MongoDB (local by default)
mongoose.connect('mongodb://localhost:27017/scentify', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User schema
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

// Product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: { type: String, enum: ['mens', 'womens', 'luxury'], required: true },
  rating: { type: Number, default: 0 },
  specs: { type: Map, of: String }
});

// OrderItem subdocument
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }
});

// Order schema
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  status: { type: String, default: 'pending' },
  total: { type: Number, required: true }
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = {
  mongoose,
  User,
  Product,
  Order
}; 