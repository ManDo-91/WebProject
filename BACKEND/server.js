const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const { mongoose, User, Product, Order } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Admin registration key
const ADMIN_KEY = 'SCENTIFY-ADMIN-2024';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// MongoDB connection error handling
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB successfully');
});

// Helper: authenticate user by token (for demo, use email in header)
async function authenticate(req, res, next) {
    const email = req.headers['x-user-email'];
    console.log('Authenticate Middleware Debug: Received x-user-email:', email);

    if (!email) return res.status(401).json({ message: 'Not authenticated' });
    try {
        const user = await User.findOne({ email });
        console.log('Authenticate Middleware Debug: User found by email:', !!user);
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Server error during authentication' });
    }
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const trimmedEmail = email.trim().toLowerCase(); // Trim and lowercase email
    const trimmedPassword = password.trim(); // Trim password

    console.log('Login attempt:', { email: trimmedEmail, password: '[REDACTED]' });

    try {
        const user = await User.findOne({ email: trimmedEmail }); // Find by trimmed, lowercased email
        console.log('User found:', !!user); // Log if user was found

        if (user) {
            console.log('Login Debug: User DB hash', user.password.length > 0 ? '[REDACTED]' : '[EMPTY]');
            const passwordMatch = bcrypt.compareSync(trimmedPassword, user.password); // Compare trimmed password
            console.log('Login Debug: bcrypt.compareSync result', passwordMatch);

            if (passwordMatch) {
                console.log('Password matched!');
                res.json({
                    token: 'user-token-' + Date.now(),
                    name: user.fullname,
                    email: user.email,
                    role: user.role,
                    isAdmin: user.role === 'admin'
                });
            } else {
                console.log('Login failed: Password mismatch.');
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } else {
            console.log('Login failed: User not found.');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login process:', error);
        res.status(500).json({ message: 'An error occurred during login. Please try again.' });
    }
});

app.post('/api/auth/signup', async (req, res) => {
    const { fullname, email, password, adminKey } = req.body;
    const trimmedEmail = email.trim().toLowerCase(); // Trim and lowercase email
    const trimmedPassword = password.trim(); // Trim password

    console.log('Signup attempt:', { fullname, email: trimmedEmail, password: '[REDACTED]', adminKey });
    
    if (await User.findOne({ email: trimmedEmail })) {
        return res.status(400).json({ message: 'Email already registered' });
    }
    const trimmedAdminKey = (adminKey || '').trim();
    if (adminKey !== undefined && trimmedAdminKey !== ADMIN_KEY) {
        return res.status(401).json({ message: 'Invalid admin registration key' });
    }
    const isAdmin = trimmedAdminKey === ADMIN_KEY;
    
    console.log('Signup Debug: Plaintext password (trimmed)', trimmedPassword.length > 0 ? '[REDACTED]' : '[EMPTY]');
    const hashedPassword = bcrypt.hashSync(trimmedPassword, 10); // Hash trimmed password
    console.log('Signup Debug: Hashed password', hashedPassword.length > 0 ? '[REDACTED]' : '[EMPTY]');

    try {
        const newUser = new User({
            fullname,
            email: trimmedEmail, // Save trimmed, lowercased email
            password: hashedPassword,
            role: isAdmin ? 'admin' : 'user'
        });
        await newUser.save(); // Explicitly save the new user
        res.status(201).json({
            token: 'user-token-' + Date.now(),
            name: newUser.fullname,
            email: newUser.email,
            role: newUser.role,
            isAdmin: newUser.role === 'admin'
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Profile routes
app.get('/api/profile', authenticate, async (req, res) => {
    res.json({
        fullname: req.user.fullname,
        email: req.user.email,
        role: req.user.role,
        _id: req.user._id // Include Mongoose _id for consistency
    });
});

app.put('/api/profile', authenticate, async (req, res) => {
    const { fullname } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(req.user._id, { fullname }, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Profile updated', fullname: updatedUser.fullname });
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

app.post('/api/products', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { name, description, price, image } = req.body;
    try {
        const product = await Product.create({ name, description, price, image });
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product' });
    }
});

app.put('/api/products/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { name, description, price, image } = req.body;
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { name, description, price, image }, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product' });
    }
});

app.delete('/api/products/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        const result = await Product.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
});

// Orders
app.get('/api/orders', authenticate, async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'admin') {
            orders = await Order.find({}).populate('user').populate('items.product');
        } else {
            orders = await Order.find({ user: req.user._id }).populate('items.product');
        }
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

app.post('/api/orders', authenticate, async (req, res) => {
    const { items } = req.body; // items: [{ productId, quantity }]
    if (!items || !items.length) {
        return res.status(400).json({ message: 'Order must contain items' });
    }

    let total = 0;
    const orderItems = [];

    try {
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

        res.status(201).json(newOrder);

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
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
            Order.find({}).select('total') // Only fetch total for revenue calculation
        ]);
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        res.json({
            userCount,
            orderCount,
            productCount,
            totalRevenue
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching admin stats' });
    }
});

// Start server (no sequelize.sync needed for Mongoose)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Admin Registration Key: ${ADMIN_KEY}`);
}); 