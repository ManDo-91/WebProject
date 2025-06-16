const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required']
    },
    stock: {
        type: Number,
        min: 0,
        default: 0
    },
    images: [{
        type: String
    }],
    mainImage: {
        type: String,
        required: [true, 'Main image is required']
    }
}, {
    timestamps: true
});

// Indexes
productSchema.index({ name: 1, category: 1 });
productSchema.index({ price: 1, stock: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
