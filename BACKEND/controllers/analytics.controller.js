const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const analyticsController = {
    // Sales Analytics
    getSalesAnalytics: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const query = {};
            
            if (startDate && endDate) {
                query.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const orders = await Order.find(query);
            
            const salesData = {
                totalSales: orders.reduce((sum, order) => sum + order.totalAmount, 0),
                totalOrders: orders.length,
                averageOrderValue: orders.length > 0 
                    ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length 
                    : 0,
                salesByStatus: orders.reduce((acc, order) => {
                    acc[order.status] = (acc[order.status] || 0) + 1;
                    return acc;
                }, {}),
                salesByPaymentMethod: orders.reduce((acc, order) => {
                    acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.totalAmount;
                    return acc;
                }, {})
            };

            res.json(salesData);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Inventory Analytics
    getInventoryAnalytics: async (req, res) => {
        try {
            const products = await Product.find();
            
            const inventoryData = {
                totalProducts: products.length,
                lowStockItems: products.filter(p => p.stock <= p.reorderLevel).length,
                totalStockValue: products.reduce((sum, product) => sum + (product.price * product.stock), 0),
                stockByCategory: products.reduce((acc, product) => {
                    acc[product.category] = (acc[product.category] || 0) + product.stock;
                    return acc;
                }, {}),
                topSellingProducts: products
                    .sort((a, b) => b.salesData.totalSold - a.salesData.totalSold)
                    .slice(0, 10)
                    .map(p => ({
                        name: p.name,
                        totalSold: p.salesData.totalSold,
                        stock: p.stock
                    }))
            };

            res.json(inventoryData);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Customer Analytics
    getCustomerAnalytics: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const query = {};
            
            if (startDate && endDate) {
                query.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const orders = await Order.find(query);
            
            const customerData = {
                totalCustomers: new Set(orders.map(order => order.customer.email)).size,
                averageOrderValue: orders.length > 0 
                    ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length 
                    : 0,
                customerRetention: orders.reduce((acc, order) => {
                    acc[order.customer.email] = (acc[order.customer.email] || 0) + 1;
                    return acc;
                }, {}),
                topCustomers: Object.entries(
                    orders.reduce((acc, order) => {
                        acc[order.customer.email] = (acc[order.customer.email] || 0) + order.totalAmount;
                        return acc;
                    }, {})
                )
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([email, total]) => ({ email, total }))
            };

            res.json(customerData);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = analyticsController; 