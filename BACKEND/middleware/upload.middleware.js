const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 5 // Max 5 files
    }
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File size error',
                message: 'File size cannot be larger than 5MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'File count error',
                message: 'Cannot upload more than 5 files'
            });
        }
        return res.status(400).json({
            error: 'Upload error',
            message: err.message
        });
    }
    if (err) {
        logger.error('File upload error:', err);
        return res.status(400).json({
            error: 'Upload error',
            message: err.message
        });
    }
    next();
};

module.exports = {
    upload,
    handleUploadError
}; 