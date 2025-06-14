const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth.middleware');

router.use(adminAuth);

// Placeholder routes - we'll implement these later
router.get('/', (req, res) => {
    res.json({ message: 'User routes working' });
});

module.exports = router; 
