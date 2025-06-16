const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Create cache instance
const cache = new NodeCache({
    stdTTL: 600, // 10 minutes
    checkperiod: 120, // 2 minutes
    useClones: false
});

/**
 * Cache middleware
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key
        const key = `__express__${req.originalUrl || req.url}`;

        // Try to get cached response
        const cachedResponse = cache.get(key);
        if (cachedResponse) {
            logger.info('Cache hit:', key);
            return res.json(cachedResponse);
        }

        // Store original res.json
        const originalJson = res.json;

        // Override res.json method
        res.json = function(body) {
            // Cache the response
            cache.set(key, body, duration);
            logger.info('Cache miss, storing:', key);

            // Call original res.json
            return originalJson.call(this, body);
        };

        next();
    };
};

/**
 * Clear cache for a specific key
 * @param {string} key - Cache key
 */
const clearCache = (key) => {
    cache.del(key);
    logger.info('Cache cleared:', key);
};

/**
 * Clear all cache
 */
const clearAllCache = () => {
    cache.flushAll();
    logger.info('All cache cleared');
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
const getCacheStats = () => {
    return cache.getStats();
};

module.exports = {
    cacheMiddleware,
    clearCache,
    clearAllCache,
    getCacheStats
}; 
