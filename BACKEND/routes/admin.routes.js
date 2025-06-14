const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminAuth } = require('../middleware/auth.middleware');

// All admin routes are protected
router.use(adminAuth);

// Dashboard routes
router.get('/dashboard', adminController.getDashboardOverview);
router.get('/system-status', adminController.getSystemStatus);
router.get('/recent-activities', adminController.getRecentActivities);

module.exports = router; 