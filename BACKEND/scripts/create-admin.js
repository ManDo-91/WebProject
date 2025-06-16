const mongoose = require('mongoose');
const User = require('../models/user.model');
const dotenv = require('dotenv');

dotenv.config();

const createAdminUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-dashboard', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully!');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            process.exit(0);
        }

        console.log('Creating admin user...');
        const adminUser = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            isActive: true
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email:', adminUser.email);
        console.log('Password:', 'admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser(); 
