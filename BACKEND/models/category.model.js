const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
        type: String
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    level: {
        type: Number,
        default: 0
    },
    path: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    image: {
        type: String
    },
    icon: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    attributes: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['text', 'number', 'boolean', 'select', 'multiselect'],
            required: true
        },
        required: {
            type: Boolean,
            default: false
        },
        options: [{
            type: String
        }]
    }],
    seo: {
        title: String,
        description: String,
        keywords: [String]
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ level: 1 });

// Pre-save middleware
categorySchema.pre('save', async function(next) {
    // Generate slug from name if not provided
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Calculate level and path
    if (this.parent) {
        const parent = await this.constructor.findById(this.parent);
        if (parent) {
            this.level = parent.level + 1;
            this.path = [...parent.path, parent._id];
        }
    } else {
        this.level = 0;
        this.path = [];
    }

    next();
});

// Get full path names
categorySchema.methods.getFullPath = async function() {
    const path = await this.populate('path');
    return path.path.map(cat => cat.name).join(' > ');
};

// Get all children
categorySchema.methods.getChildren = async function() {
    return await this.constructor.find({ path: this._id });
};

// Get all descendants
categorySchema.methods.getDescendants = async function() {
    return await this.constructor.find({ path: this._id });
};

// Get siblings
categorySchema.methods.getSiblings = async function() {
    return await this.constructor.find({
        parent: this.parent,
        _id: { $ne: this._id }
    });
};

// Get ancestors
categorySchema.methods.getAncestors = async function() {
    return await this.constructor.find({ _id: { $in: this.path } });
};

// Static method to build tree
categorySchema.statics.buildTree = async function() {
    const categories = await this.find().sort('order');
    const tree = [];
    const map = {};

    categories.forEach(category => {
        map[category._id] = category;
        category.children = [];
    });

    categories.forEach(category => {
        if (category.parent) {
            map[category.parent].children.push(category);
        } else {
            tree.push(category);
        }
    });

    return tree;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 
