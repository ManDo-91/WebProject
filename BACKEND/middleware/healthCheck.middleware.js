const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Health check middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const healthCheck = async (req, res) => {
    try {
        // Check database connection
        const dbState = mongoose.connection.readyState;
        const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

        // Check memory usage
        const memoryUsage = process.memoryUsage();
        const memoryStatus = {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
        };

        // Check uptime
        const uptime = process.uptime();
        const uptimeStatus = {
            seconds: Math.floor(uptime),
            minutes: Math.floor(uptime / 60),
            hours: Math.floor(uptime / 3600),
            days: Math.floor(uptime / 86400)
        };

        // Prepare health status
        const healthStatus = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: uptimeStatus,
            memory: memoryStatus,
            database: {
                status: dbStatus,
                state: dbState
            }
        };

        // Log health check
        logger.info('Health check:', healthStatus);

        // Send response
        res.status(200).json(healthStatus);
    } catch (error) {
        logger.error('Health check error:', error);

        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
};

module.exports = healthCheck; 