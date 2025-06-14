const morgan = require('morgan');
const logger = require('../utils/logger');

/**
 * Custom token for request body
 */
morgan.token('body', (req) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        return JSON.stringify(req.body);
    }
    return '';
});

/**
 * Custom token for response time in milliseconds
 */
morgan.token('response-time-ms', (req, res) => {
    if (!res._header || !req._startAt) return '';
    const diff = process.hrtime(req._startAt);
    const ms = diff[0] * 1e3 + diff[1] * 1e-6;
    return ms.toFixed(2);
});

/**
 * Custom format for development environment
 */
const devFormat = ':method :url :status :response-time-ms ms - :res[content-length] - :body';

/**
 * Custom format for production environment
 */
const prodFormat = ':remote-addr - :method :url :status :response-time-ms ms :res[content-length]';

/**
 * Request logging middleware
 */
const requestLogger = morgan(process.env.NODE_ENV === 'production' ? prodFormat : devFormat, {
    stream: {
        write: (message) => {
            logger.info(message.trim());
        }
    },
    skip: (req, res) => {
        // Skip logging for health check endpoints
        return req.path === '/health' || req.path === '/ping';
    }
});

module.exports = requestLogger; 