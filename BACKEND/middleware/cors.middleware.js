const cors = require('cors');
const logger = require('../utils/logger');

/**
 * CORS options
 */
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) === -1) {
            logger.warn('CORS blocked request from origin:', origin);
            return callback(new Error('Not allowed by CORS'), false);
        }

        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

/**
 * CORS middleware
 */
const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware; 