const mongoose = require('mongoose');
const User = require('../models/user.model');
const dotenv = require('dotenv');

dotenv.config();

const verifyAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-dashboard', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully!');

        // Find admin user
        const adminUser = await User.findOne({ email: 'admin@example.com' });
        
        if (adminUser) {
            console.log('\nAdmin user details:');
            console.log('------------------');
            console.log('Email:', adminUser.email);
            console.log('Username:', adminUser.username);
            console.log('Role:', adminUser.role);
            console.log('Is Active:', adminUser.isActive);
            console.log('Created At:', adminUser.createdAt);
            
            // Test password
            const isPasswordValid = await adminUser.comparePassword('admin123');
            console.log('\nPassword check:');
            console.log('Password "admin123" is', isPasswordValid ? 'VALID' : 'INVALID');
        } else {
            console.log('\nNo admin user found with email: admin@example.com');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyAdmin(); 
