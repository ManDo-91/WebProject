const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/error.middleware');
const corsMiddleware = require('./middleware/cors.middleware');
const securityMiddleware = require('./middleware/security.middleware');
const compressionMiddleware = require('./middleware/compression.middleware');
const requestLogger = require('./middleware/requestLogger.middleware');
const healthCheck = require('./middleware/healthCheck.middleware');
const { swaggerMiddleware, getSwaggerSpec } = require('./middleware/swagger.middleware');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    logger.info('Connected to MongoDB');
})
.catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
});

// Apply middleware
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(compressionMiddleware);
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API Documentation
app.use('/api-docs', swaggerMiddleware);
app.get('/api-docs.json', getSwaggerSpec);

// Health check endpoint
app.get('/health', healthCheck);

// API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

// Error handling
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

module.exports = app; 