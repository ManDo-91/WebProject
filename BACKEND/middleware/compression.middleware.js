const compression = require('compression');
const logger = require('../utils/logger');

/**
 * Compression middleware configuration
 */
const compressionMiddleware = compression({
    // Only compress responses larger than 1kb
    threshold: 1024,
    
    // Compression level (1-9, where 9 is maximum compression)
    level: 6,
    
    // Filter function to determine if response should be compressed
    filter: (req, res) => {
        // Don't compress if client explicitly doesn't want compression
        if (req.headers['x-no-compression']) {
            return false;
        }

        // Use default compression filter
        return compression.filter(req, res);
    },
    
    // Log compression events
    onResponse: (req, res) => {
        const originalSize = res.getHeader('content-length');
        const compressedSize = res.getHeader('content-encoding') ? 
            res.getHeader('content-length') : originalSize;

        if (originalSize && compressedSize) {
            const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
            logger.info('Response compressed:', {
                path: req.path,
                method: req.method,
                originalSize,
                compressedSize,
                compressionRatio: `${compressionRatio}%`
            });
        }
    }
});

module.exports = compressionMiddleware; 