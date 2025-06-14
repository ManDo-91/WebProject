const Product = require('../models/product.model');
const Category = require('../models/category.model');
const logger = require('../utils/logger');
const { uploadToCloudinary } = require('../utils/cloudinary');

const productController = {
    // Create new product
    createProduct: async (req, res) => {
        try {
            const productData = req.body;
            
            // Handle image uploads
            if (req.files) {
                const uploadPromises = req.files.map(file => uploadToCloudinary(file));
                const uploadedImages = await Promise.all(uploadPromises);
                productData.images = uploadedImages.map(img => img.secure_url);
                productData.mainImage = uploadedImages[0].secure_url;
            }

            const product = new Product(productData);
            await product.save();

            logger.info(`New product created: ${product._id}`);
            res.status(201).json(product);
        } catch (error) {
            logger.error('Product creation error:', error);
            res.status(400).json({ message: error.message });
        }
    },

    // Get all products with filtering and pagination
    getProducts: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                sort = '-createdAt',
                category,
                brand,
                minPrice,
                maxPrice,
                rating,
                search,
                status = 'published'
            } = req.query;

            const query = { status };

            // Apply filters
            if (category) query.category = category;
            if (brand) query.brand = brand;
            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = Number(minPrice);
                if (maxPrice) query.price.$lte = Number(maxPrice);
            }
            if (rating) query['rating.average'] = { $gte: Number(rating) };
            if (search) {
                query.$text = { $search: search };
            }

            const products = await Product.find(query)
                .sort(sort)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .populate('category', 'name slug')
                .lean();

            const count = await Product.countDocuments(query);

            res.json({
                products,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                totalProducts: count
            });
        } catch (error) {
            logger.error('Product fetch error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get product by ID
    getProductById: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id)
                .populate('category', 'name slug')
                .populate('reviews.user', 'username')
                .lean();

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json(product);
        } catch (error) {
            logger.error('Product fetch error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Update product
    updateProduct: async (req, res) => {
        try {
            const productData = req.body;
            
            // Handle image uploads
            if (req.files) {
                const uploadPromises = req.files.map(file => uploadToCloudinary(file));
                const uploadedImages = await Promise.all(uploadPromises);
                productData.images = uploadedImages.map(img => img.secure_url);
                if (uploadedImages.length > 0) {
                    productData.mainImage = uploadedImages[0].secure_url;
                }
            }

            const product = await Product.findByIdAndUpdate(
                req.params.id,
                productData,
                { new: true, runValidators: true }
            );

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            logger.info(`Product updated: ${product._id}`);
            res.json(product);
        } catch (error) {
            logger.error('Product update error:', error);
            res.status(400).json({ message: error.message });
        }
    },

    // Delete product
    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            logger.info(`Product deleted: ${product._id}`);
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            logger.error('Product deletion error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Add product review
    addReview: async (req, res) => {
        try {
            const { rating, title, comment } = req.body;
            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Check if user has already reviewed
            const existingReview = product.reviews.find(
                review => review.user.toString() === req.user.id
            );

            if (existingReview) {
                return res.status(400).json({ message: 'You have already reviewed this product' });
            }

            // Add review
            product.reviews.push({
                user: req.user.id,
                rating,
                title,
                comment
            });

            await product.save();
            logger.info(`Review added to product: ${product._id}`);
            res.json(product);
        } catch (error) {
            logger.error('Review addition error:', error);
            res.status(400).json({ message: error.message });
        }
    },

    // Update product review
    updateReview: async (req, res) => {
        try {
            const { rating, title, comment } = req.body;
            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const review = product.reviews.id(req.params.reviewId);

            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            if (review.user.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to update this review' });
            }

            review.rating = rating;
            review.title = title;
            review.comment = comment;

            await product.save();
            logger.info(`Review updated for product: ${product._id}`);
            res.json(product);
        } catch (error) {
            logger.error('Review update error:', error);
            res.status(400).json({ message: error.message });
        }
    },

    // Delete product review
    deleteReview: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const review = product.reviews.id(req.params.reviewId);

            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            if (review.user.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to delete this review' });
            }

            review.remove();
            await product.save();
            logger.info(`Review deleted from product: ${product._id}`);
            res.json(product);
        } catch (error) {
            logger.error('Review deletion error:', error);
            res.status(400).json({ message: error.message });
        }
    },

    // Get product recommendations
    getRecommendations: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Find similar products based on category and tags
            const recommendations = await Product.find({
                _id: { $ne: product._id },
                category: product.category,
                status: 'published',
                $or: [
                    { tags: { $in: product.tags } },
                    { brand: product.brand }
                ]
            })
            .sort({ 'rating.average': -1, 'salesData.totalSold': -1 })
            .limit(5)
            .select('name price mainImage rating')
            .lean();

            res.json(recommendations);
        } catch (error) {
            logger.error('Recommendations fetch error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Bulk update products
    bulkUpdate: async (req, res) => {
        try {
            const { updates } = req.body;
            const operations = updates.map(update => ({
                updateOne: {
                    filter: { _id: update.id },
                    update: { $set: update.data }
                }
            }));

            const result = await Product.bulkWrite(operations);
            logger.info('Bulk update completed:', result);
            res.json(result);
        } catch (error) {
            logger.error('Bulk update error:', error);
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = productController; 