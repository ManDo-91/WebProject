require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const { mongoose, User, Product, Order, Rating } = require('./models');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const https = require('https');
const { sendEmail, sendPasswordResetEmail, sendWelcomeEmail, sendOrderConfirmationEmail } = require('./src/utils/email');

const app = express();
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// SSL Certificate configuration
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt'))
};

// Admin registration key
const ADMIN_KEY = 'SCENTIFY-ADMIN-2024';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads', 'products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.error('Multer error:', error);
        return res.status(400).json({
            message: 'File upload error',
            error: error.message
        });
    }
    next(error);
});

// CORS configuration
const corsOptions = {
    origin: [
        'https://localhost:5443',
        'https://127.0.0.1:5443',
        'https://localhost:*',
        'https://127.0.0.1:*',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-email'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes middleware
app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection error handling
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB successfully');
});

// Helper: authenticate user by token
async function authenticate(req, res, next) {
    try {
        console.log('Auth Headers:', req.headers);
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            console.log('No authorization header found');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader;

        if (!token) {
            console.log('No token found in authorization header');
            return res.status(401).json({ message: 'Authentication required' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log('Decoded token:', decoded);

            // LOG: Show what field is used for user lookup
            if (decoded.id) {
                console.log('Looking up user by id:', decoded.id);
            } else if (decoded.userId) {
                console.log('Looking up user by userId:', decoded.userId);
            } else {
                console.log('No user id field in token:', decoded);
            }

            // Try both id and userId for compatibility
            const userId = decoded.id || decoded.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Invalid token payload' });
            }

            const user = await User.findById(userId);
            console.log('Found user:', user ? 'Yes' : 'No');

            if (!user) {
                console.log('User not found for ID:', userId);
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    console.log('Login attempt:', { email: trimmedEmail });

    try {
        const user = await User.findOne({ email: trimmedEmail });
        console.log('User found:', !!user);

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(trimmedPassword, user.password);
        console.log('Password match:', passwordMatch);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('Generated token:', token);

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.fullname,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

app.post('/api/auth/signup', async (req, res) => {
    const { fullname, email, password, adminKey } = req.body;
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    console.log('Signup attempt:', { 
        fullname, 
        email: trimmedEmail,
        hasAdminKey: !!adminKey,
        adminKeyValue: adminKey 
    });

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
            console.log('User already exists:', existingUser.email);
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Validate admin key if provided
        let role = 'user';
        if (adminKey) {
            console.log('Admin key provided, checking against:', ADMIN_KEY);
            if (adminKey === ADMIN_KEY) {
                role = 'admin';
                console.log('Admin key valid, setting role to admin');
            } else {
                console.log('Invalid admin key provided');
                return res.status(401).json({ message: 'Invalid admin registration key' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

        // Create new user
        const newUser = new User({
            fullname,
            email: trimmedEmail,
            password: hashedPassword,
            role: role
        });

        console.log('Attempting to save new user:', {
            email: newUser.email,
            role: newUser.role,
            hasPassword: !!newUser.password
        });

        await newUser.save();
        console.log('User saved successfully:', {
            id: newUser._id,
            email: newUser.email,
            role: newUser.role
        });

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newUser._id,
                email: newUser.email,
                role: newUser.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.fullname,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'An error occurred during registration' });
    }
});

// Profile routes
app.get('/api/profile', async (req, res) => {
    try {
        const userEmail = req.headers['x-user-email'];
        if (!userEmail) {
            return res.status(401).json({ message: 'User email is required' });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            fullname: user.fullname,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile data' });
    }
});

app.put('/api/profile', async (req, res) => {
    try {
        const userEmail = req.headers['x-user-email'];
        if (!userEmail) {
            return res.status(401).json({ message: 'User email is required' });
        }

        const { fullname } = req.body;
        if (!fullname) {
            return res.status(400).json({ message: 'Full name is required' });
        }

        const user = await User.findOneAndUpdate(
            { email: userEmail },
            { fullname },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            fullname: user.fullname,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

app.put('/api/profile/password', authenticate, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const trimmedOldPassword = oldPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    if (!bcrypt.compareSync(trimmedOldPassword, req.user.password)) {
        return res.status(400).json({ message: 'Old password is incorrect' });
    }
    try {
        req.user.password = bcrypt.hashSync(trimmedNewPassword, 10);
        await req.user.save();
        res.json({ message: 'Password updated' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

// Product routes
app.get('/api/products', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        // Add search filter if search term is provided
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Add category filter if category is provided
        if (category && category !== 'all') {
            query.category = category;
        }

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Add endpoint to get a single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        // Check if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product' });
    }
});

app.post('/api/products', authenticate, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    try {
        const { name, description, price, category } = req.body;
        
        // Get the uploaded files
        const files = req.files;
        if (!files || (!files.mainImage && !files.images)) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        // Process uploaded files with correct paths
        const images = files.images ? files.images.map(file => file.filename) : [];
        const mainImage = files.mainImage ? files.mainImage[0].filename : null;

        // Create product
        const product = await Product.create({
            name: name || 'Untitled Product',
            description: description || '',
            price: price || 0,
            category: category || null,
            mainImage,
            images
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        // Clean up uploaded files if there's an error
        if (req.files) {
            const files = req.files;
            if (files.mainImage) {
                files.mainImage.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            if (files.images) {
                files.images.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
        }
        res.status(500).json({ message: error.message || 'Error creating product' });
    }
});

app.put('/api/products/:id', authenticate, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    try {
        const { name, description, price, category } = req.body;
        
        // Get the uploaded files
        const files = req.files;
        let images = [];
        let mainImage = null;

        if (files) {
            if (files.images) {
                images = files.images.map(file => file.filename);
            }
            if (files.mainImage) {
                mainImage = files.mainImage[0].filename;
            }
        }

        const updateData = {
            name: name || 'Untitled Product',
            description: description || '',
            price: price || 0,
            category: category || null
        };

        if (images.length > 0) {
            updateData.images = images;
        }
        if (mainImage) {
            updateData.mainImage = mainImage;
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product' });
    }
});

app.delete('/api/products/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ 
            message: 'Error deleting product',
            error: error.message 
        });
    }
});

// Product rating endpoint
app.post('/api/products/rate', authenticate, async (req, res) => {
    const { productId, rating, review } = req.body;
    const userId = req.user._id;

    try {
        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user has already rated this product
        const existingRating = await Rating.findOne({ product: productId, user: userId });
        
        if (existingRating) {
            // Update existing rating
            existingRating.rating = rating;
            existingRating.review = review;
            await existingRating.save();
        } else {
            // Create new rating
            const newRating = new Rating({
                product: productId,
                user: userId,
                rating,
                review
            });
            await newRating.save();
        }

        // Calculate new average rating
        const ratings = await Rating.find({ product: productId });
        const totalRatings = ratings.length;
        const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;

        // Update product rating
        product.rating = averageRating;
        product.reviews = totalRatings;
        await product.save();

        res.json({
            message: 'Rating submitted successfully',
            averageRating,
            totalReviews: totalRatings
        });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ message: 'Error submitting rating' });
    }
});

// Orders
app.post('/api/orders', authenticate, async (req, res) => {
    try {
        const { items } = req.body; // items: [{ productId, quantity }]
        if (!items || !items.length) {
            return res.status(400).json({ message: 'Order must contain items' });
        }

        let total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }
            total += product.price * item.quantity;
            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });
        }

        const newOrder = await Order.create({
            user: req.user._id,
            items: orderItems,
            total,
            status: 'pending'
        });

        // Populate the order with product details
        const populatedOrder = await Order.findById(newOrder._id)
            .populate('items.product')
            .populate('user', 'fullname email');

        // Send order confirmation email
        try {
            await sendOrderConfirmationEmail(
                populatedOrder.user.email,
                populatedOrder.user.fullname,
                populatedOrder
            );
        } catch (emailError) {
            console.error('Error sending order confirmation email:', emailError);
            // Don't fail the order creation if email fails
        }

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

// Get user's orders
app.get('/api/orders', authenticate, async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'admin') {
            // Only get documents that have a user field
            orders = await Order.find({ user: { $exists: true } })
                .populate('user', 'fullname email')
                .populate('items.product')
                .sort({ createdAt: -1 });
        } else {
            orders = await Order.find({ user: req.user._id })
                .populate('user', 'fullname email')
                .populate('items.product')
                .sort({ createdAt: -1 });
        }
        console.log('Orders being sent to frontend:', JSON.stringify(orders, null, 2));
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Get single order details
app.get('/api/orders/:orderId', authenticate, async (req, res) => {
    try {
        const { orderId } = req.params;
        const user = req.user;

        // Find the order
        const order = await Order.findById(orderId)
            .populate('items.product')
            .populate('user', 'fullname email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is admin or the order owner
        if (user.role !== 'admin' && order.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Error fetching order details' });
    }
});

// Admin analytics stats endpoint
app.get('/api/admin/stats', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        const [userCount, orderCount, productCount, orders] = await Promise.all([
            User.countDocuments(),
            Order.countDocuments(),
            Product.countDocuments(),
            Order.find({}).populate('items.product') // Populate products to get their names
        ]);

        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

        // Calculate Top Products
        const productSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.product && item.product.name) { // Ensure product and name exist
                    const productName = item.product.name;
                    productSales[productName] = (productSales[productName] || 0) + item.quantity;
                }
            });
        });

        const sortedProducts = Object.entries(productSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // Get top 5 products

        const topProducts = {
            labels: sortedProducts.map(([name]) => name),
            values: sortedProducts.map(([, count]) => count)
        };

        // Basic Demographics (Example: just a placeholder or based on user count for now)
        // If you have specific demographic fields (e.g., age, gender),
        // you would need to query the User model accordingly.
        const demographics = {
            labels: ['Existing Users', 'New Users'],
            values: [userCount - (userCount > 10 ? 10 : 0), (userCount > 10 ? 10 : userCount)] // Placeholder logic
        };
        // In a real application, you'd fetch actual demographic data from your User model
        // e.g., User.aggregate([{$group: {_id: "$gender", count: {$sum: 1}}}])

        // Calculate Revenue by Category
        const categoryRevenue = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                // Ensure product and category exist and have a name/price
                if (item.product && item.product.category && item.product.category.name && item.product.price) {
                    const categoryName = item.product.category.name;
                    categoryRevenue[categoryName] = (categoryRevenue[categoryName] || 0) + (item.quantity * item.product.price);
                }
            });
        });

        const revenueByCategory = {
            labels: Object.keys(categoryRevenue),
            values: Object.values(categoryRevenue).map(rev => parseFloat(rev.toFixed(2))) // Format to 2 decimal places
        };

        // Calculate Sales Overview (monthly sales)
        const salesByMonth = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const month = monthNames[orderDate.getMonth()];
            salesByMonth[month] = (salesByMonth[month] || 0) + order.total;
        });

        // Ensure all months are present, even if sales are 0
        const salesData = {
            labels: monthNames, // Use all months for consistent labels
            values: monthNames.map(month => parseFloat((salesByMonth[month] || 0).toFixed(2)))
        };

        res.json({
            userCount,
            orderCount,
            productCount,
            totalRevenue,
            topProducts,
            demographics,
            revenueByCategory,
            salesData // Include salesData here
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching admin stats' });
    }
});

// Auth verification endpoint
app.get('/api/auth/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        res.json({
            success: true,
            message: 'Admin authentication successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Auth verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
});

// Admin users endpoint
app.get('/api/admin/users', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Admin activity endpoint
app.get('/api/admin/activity', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    try {
        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'fullname email');

        // Get recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('-password');

        // Get recent product updates
        const recentProducts = await Product.find()
            .sort({ updatedAt: -1 })
            .limit(5);

        // Combine and format activities
        const activities = [
            ...recentOrders.map(order => ({
                type: 'order',
                title: `New order #${order._id.toString().slice(-6)} from ${order.user.fullname}`,
                time: order.createdAt
            })),
            ...recentUsers.map(user => ({
                type: 'customer',
                title: `New ${user.role} registration: ${user.fullname}`,
                time: user.createdAt
            })),
            ...recentProducts.map(product => ({
                type: 'product',
                title: `Product updated: ${product.name}`,
                time: product.updatedAt
            }))
        ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10); // Get only the 10 most recent activities

        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Error fetching activities' });
    }
});

// Admin delete user endpoint
app.delete('/api/admin/users/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Admin create user endpoint
app.post('/api/admin/users', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    try {
        const { fullname, email, password, role } = req.body;
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        // Check if user already exists
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

        // Create new user
        const newUser = new User({
            fullname,
            email: trimmedEmail,
            password: hashedPassword,
            role: role || 'user'
        });

        await newUser.save();

        // Return user without password
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Category routes
app.get('/api/categories', authenticate, (req, res) => {
    try {
        const categories = [
            { _id: 'mens', name: 'Mens' },
            { _id: 'womens', name: 'Womens' },
            { _id: 'luxury', name: 'Luxury' }
        ];
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Test email configuration
app.get('/api/test-email', authenticate, async (req, res) => {
    try {
        await sendEmail({
            to: req.user.email,
            subject: 'Test Email',
            text: 'This is a test email to verify your email configuration.',
            html: '<h1>Test Email</h1><p>This is a test email to verify your email configuration.</p>'
        });
        res.json({ message: 'Test email sent successfully' });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ message: 'Error sending test email', error: error.message });
    }
});

// Update order status
app.put('/api/orders/:orderId/status', authenticate, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, notes } = req.body;
        const user = req.user;

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update order status' });
        }

        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find and update order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order status
        order.status = status;
        if (notes) {
            order.notes = notes;
        }

        // If status is delivered, set actual delivery date
        if (status === 'delivered') {
            order.actualDelivery = new Date();
        }

        await order.save();

        // Populate order details for response
        const updatedOrder = await Order.findById(orderId)
            .populate('items.product')
            .populate('user', 'fullname email');

        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

// Get user by ID
app.get('/api/users/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

// Update user
app.put('/api/users/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, email, isAdmin, password } = req.body;

        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        user.fullName = fullName;
        user.email = email;
        user.isAdmin = isAdmin;

        // Update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Save updated user
        await user.save();

        // Return updated user (excluding password)
        const updatedUser = await User.findById(userId).select('-password');
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Start both HTTP and HTTPS servers
app.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
});

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});

// Serve static files from uploads directory
const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('Serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Serve static files from products directory
app.use('/uploads/products', express.static(path.join(__dirname, 'uploads', 'products')));

// Fallback for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
}); 
