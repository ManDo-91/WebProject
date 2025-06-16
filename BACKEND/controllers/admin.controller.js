const User = require('../models/user.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

const adminController = {
    // Get dashboard overview
    getDashboardOverview: async (req, res) => {
        try {
            const [
                totalUsers,
                totalOrders,
                totalProducts,
                recentOrders
            ] = await Promise.all([
                User.countDocuments(),
                Order.countDocuments(),
                Product.countDocuments(),
                Order.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate('items.product')
            ]);

            const dashboardData = {
                totalUsers,
                totalOrders,
                totalProducts,
                recentOrders,
                lowStockProducts: await Product.find({ stock: { $lte: 10 } }).count(),
                pendingOrders: await Order.countDocuments({ status: 'pending' })
            };

            res.json(dashboardData);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get system status
    getSystemStatus: async (req, res) => {
        try {
            const systemStatus = {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                activeUsers: await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
                databaseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
            };

            res.json(systemStatus);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get recent activities
    getRecentActivities: async (req, res) => {
        try {
            const activities = await Promise.all([
                Order.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('orderNumber status createdAt'),
                User.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('username role createdAt'),
                Product.find()
                    .sort({ updatedAt: -1 })
                    .limit(5)
                    .select('name stock updatedAt')
            ]);

            const [recentOrders, recentUsers, recentProducts] = activities;

            res.json({
                recentOrders,
                recentUsers,
                recentProducts
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = adminController; 
