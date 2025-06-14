const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Create a rate limiter
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options) => {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        message: {
            error: 'Too many requests',
            message: options.message
        },
        handler: (req, res, next, options) => {
            logger.warn('Rate limit exceeded:', {
                ip: req.ip,
                path: req.path,
                method: req.method
            });
            res.status(429).json(options.message);
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

// Global rate limiter
const globalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Auth rate limiter
const authLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per window
    message: 'Too many login attempts, please try again after an hour'
});

// API rate limiter
const apiLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per window
    message: 'Too many API requests, please try again after a minute'
});

module.exports = {
    globalLimiter,
    authLimiter,
    apiLimiter
}; 