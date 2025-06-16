const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: true
    },
    shippingMethod: {
        type: String,
        required: true
    },
    shippingCost: {
        type: Number,
        required: true
    },
    notes: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date
}, {
    timestamps: true
});

// Pre-save hook to calculate total amount. Ensure 'total' is used consistently if 'totalAmount' was a typo.
orderSchema.pre('save', function(next) {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    next();
});

module.exports = mongoose.model('Order', orderSchema); 
