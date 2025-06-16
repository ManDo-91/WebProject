const mongoose = require('mongoose');

// Connect to MongoDB (local by default)
mongoose.connect('mongodb://localhost:27017/scentify', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
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
  slug: { type: String },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  category: { type: String, enum: ['mens', 'womens', 'luxury'], required: true },
  brand: { type: String },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String, required: true }],
  mainImage: { type: String, required: true },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  specifications: [{
    name: String,
    value: String
  }],
  isNew: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
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
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
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
