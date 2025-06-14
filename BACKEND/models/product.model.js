const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    comment: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    helpful: {
        type: Number,
        default: 0
    },
    verifiedPurchase: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const variantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    attributes: {
        type: Map,
        of: String
    },
    images: [{
        type: String
    }]
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true,
        maxlength: 200
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    compareAtPrice: {
        type: Number,
        min: 0
    },
    costPrice: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    brand: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    reorderLevel: {
        type: Number,
        required: true,
        min: 0
    },
    variants: [variantSchema],
    images: [{
        type: String,
        required: true
    }],
    mainImage: {
        type: String,
        required: true
    },
    attributes: {
        type: Map,
        of: String
    },
    specifications: [{
        name: String,
        value: String
    }],
    reviews: [reviewSchema],
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    salesData: {
        totalSold: {
            type: Number,
            default: 0
        },
        revenue: {
            type: Number,
            default: 0
        },
        lastSold: Date
    },
    shipping: {
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        freeShipping: {
            type: Boolean,
            default: false
        }
    },
    seo: {
        title: String,
        description: String,
        keywords: [String]
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNew: {
        type: Boolean,
        default: true
    },
    isOnSale: {
        type: Boolean,
        default: false
    },
    saleStartsAt: Date,
    saleEndsAt: Date
}, {
    timestamps: true
});

// Indexes
productSchema.index({ name: 'text', description: 'text', 'tags': 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ 'salesData.totalSold': -1 });

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.rating.average = 0;
        this.rating.count = 0;
        return;
    }

    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
};

// Update sales data
productSchema.methods.updateSalesData = function(quantity, price) {
    this.salesData.totalSold += quantity;
    this.salesData.revenue += quantity * price;
    this.salesData.lastSold = new Date();
    this.stock -= quantity;
};
// Check if product is on sale
productSchema.methods.isOnSale = function() {
    const now = new Date();
    return this.isOnSale && 
           (!this.saleStartsAt || this.saleStartsAt <= now) && 
           (!this.saleEndsAt || this.saleEndsAt >= now);
};

// Get current price
productSchema.methods.getCurrentPrice = function() {
    return this.isOnSale() ? this.compareAtPrice : this.price;
};

// Pre-save middleware
productSchema.pre('save', function(next) {
    // Generate slug from name if not provided
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Calculate average rating
    this.calculateAverageRating();

    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 
