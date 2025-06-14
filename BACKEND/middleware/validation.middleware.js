const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware to validate request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation error:', errors.array());
        return res.status(400).json({
            error: 'Validation error',
            details: errors.array()
        });
    }
    next();
};

/**
 * Middleware to validate MongoDB ObjectId
 * @param {string} paramName - Name of the parameter to validate
 * @returns {Function} Express middleware
 */
const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            logger.warn(`Invalid ObjectId: ${id}`);
            return res.status(400).json({
                error: 'Validation error',
                message: `Invalid ${paramName} format`
            });
        }
        next();
    };
};

/**
 * Middleware to validate pagination parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 100) {
        logger.warn('Invalid pagination parameters:', { page, limit });
        return res.status(400).json({
            error: 'Validation error',
            message: 'Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100.'
        });
    }

    req.pagination = {
        page,
        limit,
        skip: (page - 1) * limit
    };

    next();
};

/**
 * Middleware to validate sorting parameters
 * @param {string[]} allowedFields - Array of allowed field names for sorting
 * @returns {Function} Express middleware
 */
const validateSorting = (allowedFields) => {
    return (req, res, next) => {
        const sortBy = req.query.sortBy;
        const sortOrder = req.query.sortOrder?.toLowerCase();

        if (sortBy && !allowedFields.includes(sortBy)) {
            logger.warn('Invalid sort field:', sortBy);
            return res.status(400).json({
                error: 'Validation error',
                message: `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`
            });
        }

        if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
            logger.warn('Invalid sort order:', sortOrder);
            return res.status(400).json({
                error: 'Validation error',
                message: 'Invalid sort order. Must be either "asc" or "desc"'
            });
        }

        req.sorting = {
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc'
        };

        next();
    };
};

const productValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    validateRequest
];

const orderValidation = [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.product').isMongoId().withMessage('Invalid product ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('paymentMethod').trim().notEmpty().withMessage('Payment method is required'),
    validateRequest
];

const userValidation = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'user']).withMessage('Invalid role'),
    validateRequest
];

module.exports = {
    validateRequest,
    validateObjectId,
    validatePagination,
    validateSorting,
    productValidation,
    orderValidation,
    userValidation
}; 