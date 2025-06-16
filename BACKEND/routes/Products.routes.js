const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { adminAuth } = require('../middleware/auth.middleware');
const { productValidation } = require('../middleware/validation.middleware');
const { cache, CACHE_DURATIONS } = require('../middleware/cache.middleware');
const upload = require('../middleware/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management and operations
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - brand
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 */
router.post('/',
    adminAuth,
    upload.array('images', 5),
    productValidation,
    productController.createProduct
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 */
router.get('/',
    cache(CACHE_DURATIONS.MEDIUM),
    productController.getProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id',
    cache(CACHE_DURATIONS.MEDIUM),
    productController.getProductById
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id',
    adminAuth,
    upload.array('images', 5),
    productValidation,
    productController.updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id',
    adminAuth,
    productController.deleteProduct
);

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   post:
 *     summary: Add product review
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/reviews',
    adminAuth,
    productController.addReview
);

/**
 * @swagger
 * /api/products/{id}/reviews/{reviewId}:
 *   put:
 *     summary: Update product review
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/reviews/:reviewId',
    adminAuth,
    productController.updateReview
);

/**
 * @swagger
 * /api/products/{id}/reviews/{reviewId}:
 *   delete:
 *     summary: Delete product review
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/reviews/:reviewId',
    adminAuth,
    productController.deleteReview
);

/**
 * @swagger
 * /api/products/{id}/recommendations:
 *   get:
 *     summary: Get product recommendations
 *     tags: [Products]
 */
router.get('/:id/recommendations',
    cache(CACHE_DURATIONS.LONG),
    productController.getRecommendations
);

/**
 * @swagger
 * /api/products/bulk-update:
 *   post:
 *     summary: Bulk update products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.post('/bulk-update',
    adminAuth,
    productController.bulkUpdate
);

module.exports = router; 
