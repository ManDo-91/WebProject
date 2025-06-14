const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const logger = require('../utils/logger');

/**
 * Swagger options
 */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-commerce API Documentation',
            version: '1.0.0',
            description: 'API documentation for the e-commerce platform',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'API Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: [
        './src/routes/*.js',
        './src/models/*.js',
        './src/middleware/*.js'
    ]
};

// Initialize Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Swagger documentation middleware
 */
const swaggerMiddleware = [
    // Serve Swagger UI
    swaggerUi.serve,
    
    // Setup Swagger UI
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'E-commerce API Documentation',
        customfavIcon: '/favicon.ico'
    }),

    // Log API documentation access
    (req, res, next) => {
        logger.info('API documentation accessed:', {
            path: req.path,
            method: req.method,
            ip: req.ip
        });
        next();
    }
];

/**
 * Get Swagger specification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSwaggerSpec = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
};

module.exports = {
    swaggerMiddleware,
    getSwaggerSpec
}; 