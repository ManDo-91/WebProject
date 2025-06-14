const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Convert error to API error
 * @param {Error} err - Error object
 * @returns {ApiError} API error object
 */
const convertError = (err) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error';
        error = new ApiError(statusCode, message, false);
    }

    return error;
};

/**
 * Handle MongoDB duplicate key error
 * @param {Error} err - Error object
 * @returns {ApiError} API error object
 */
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for ${field}. Please use another value.`;
    return new ApiError(409, message);
};

/**
 * Handle MongoDB validation error
 * @param {Error} err - Error object
 * @returns {ApiError} API error object
 */
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(error => error.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new ApiError(400, message);
};

/**
 * Handle MongoDB cast error
 * @param {Error} err - Error object
 * @returns {ApiError} API error object
 */
const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new ApiError(400, message);
};

/**
 * Handle JWT errors
 * @param {Error} err - Error object
 * @returns {ApiError} API error object
 */
const handleJWTError = () => {
    return new ApiError(401, 'Invalid token. Please log in again.');
};

/**
 * Handle JWT expired error
 * @param {Error} err - Error object
 * @returns {ApiError} API error object
 */
const handleJWTExpiredError = () => {
    return new ApiError(401, 'Your token has expired. Please log in again.');
};

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Log error
    logger.error('Error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        user: req.user
    });

    // Convert error to API error
    error = convertError(error);

    // Handle specific errors
    if (error.name === 'MongoError' && error.code === 11000) {
        error = handleDuplicateKeyError(error);
    }
    if (error.name === 'ValidationError') {
        error = handleValidationError(error);
    }
    if (error.name === 'CastError') {
        error = handleCastError(error);
    }
    if (error.name === 'JsonWebTokenError') {
        error = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
        error = handleJWTExpiredError();
    }

    // Send error response
    res.status(error.statusCode).json({
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

module.exports = {
    ApiError,
    errorHandler
}; 