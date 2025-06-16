const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Create a store for rate limiters
const limiters = new Map();

/**
 * Create or get a rate limiter
 * @param {string} key - Unique key for the limiter
 * @param {number} max - Maximum number of requests
 * @param {number} windowMs - Time window in seconds
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (key, max, windowMs) => {
    if (!limiters.has(key)) {
        const limiter = rateLimit({
            windowMs: windowMs * 1000, // Convert to milliseconds
            max: max,
            message: {
                error: 'Too many requests',
                message: `Please try again after ${windowMs} seconds`
            },
            handler: (req, res, next, options) => {
                logger.warn(`Rate limit exceeded for ${key}`, {
                    ip: req.ip,
                    path: req.path
                });
                res.status(429).json(options.message);
            },
            standardHeaders: true,
            legacyHeaders: false
        });

        limiters.set(key, limiter);
    }

    return limiters.get(key);
};

/**
 * Rate limit middleware factory
 * @param {string} key - Unique key for the limiter
 * @param {number} max - Maximum number of requests
 * @param {number} windowMs - Time window in seconds
 * @returns {Function} Rate limiter middleware
 */
const rateLimit = (key, max, windowMs) => {
    return createRateLimiter(key, max, windowMs);
};

// Predefined rate limiters
const rateLimiters = {
    // Authentication
    auth: rateLimit('auth', 100, 900), // 100 requests per 15 minutes
    login: rateLimit('login', 5, 900), // 5 login attempts per 15 minutes
    register: rateLimit('register', 3, 3600), // 3 registrations per hour
    passwordReset: rateLimit('password-reset', 3, 3600), // 3 password resets per hour

    // API
    api: rateLimit('api', 1000, 3600), // 1000 requests per hour
    search: rateLimit('search', 100, 3600), // 100 searches per hour
    upload: rateLimit('upload', 50, 3600), // 50 uploads per hour

    // Admin
    admin: rateLimit('admin', 1000, 3600), // 1000 requests per hour
    adminLogin: rateLimit('admin-login', 5, 900), // 5 login attempts per 15 minutes

    // Public
    public: rateLimit('public', 100, 60), // 100 requests per minute
};

module.exports = {
    rateLimit,
    rateLimiters
}; 
