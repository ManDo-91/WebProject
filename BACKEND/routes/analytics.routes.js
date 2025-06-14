const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { adminAuth } = require('../middleware/auth.middleware');

// All analytics routes are protected and require admin access
router.use(adminAuth);

// Sales analytics routes
router.get('/sales', analyticsController.getSalesAnalytics);

// Inventory analytics routes
router.get('/inventory', analyticsController.getInventoryAnalytics);

// Customer analytics routes
router.get('/customers', analyticsController.getCustomerAnalytics);

module.exports = router; 