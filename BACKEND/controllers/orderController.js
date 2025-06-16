const User = require('../models/User'); // Assuming path to User model
const Order = require('../models/Order'); // Assuming path to Order model
const Product = require('../models/Product'); // Assuming path to Product model
const { sendEmail } = require('../utils/email');

exports.createOrder = async (req, res) => {
    try {
        const { userId, items, totalAmount, shippingAddress } = req.body;
        const order = new Order({ userId, items, totalAmount, shippingAddress });
        await order.save();

        // Send order confirmation email
        const user = await User.findById(userId);

        if (user && user.email) {
            let itemRowsHtml = '';
            let subtotal = 0;

            for (const item of items) {
                const product = await Product.findById(item.productId); // Assuming item has productId
                if (product) {
                    const itemTotal = product.price * item.quantity;
                    subtotal += itemTotal;
                    itemRowsHtml += `
                        <tr>
                            <td style="text-align: left; padding: 8px; border: 1px solid #ddd;">${product.name}</td>
                            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
                            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">$${product.price.toFixed(2)}</td>
                            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">$${itemTotal.toFixed(2)}</td>
                        </tr>
                    `;
                }
            }

            const shippingCost = 10.00; // Hardcoded shipping cost as per image
            const totalAmountWithShipping = subtotal + shippingCost;

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Order Confirmation</h2>

                    <p>Hello ${user.name || 'customer'},</p>
                    <p>Thank you for your order! We're pleased to confirm that we've received your order #${order._id}.</p>

                    <h3 style="color: #555;">Order Details</h3>
                    <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Product</th>
                                <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Quantity</th>
                                <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Price</th>
                                <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemRowsHtml}
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 8px; border: 1px solid #ddd;">Subtotal:</td>
                                <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">$${subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align: right; padding: 8px; border: 1px solid #ddd;">Shipping:</td>
                                <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">$${shippingCost.toFixed(2)}</td>
                            </tr>
                            <tr style="background-color: #f2f2f2; font-weight: bold;">
                                <td colspan="3" style="text-align: right; padding: 8px; border: 1px solid #ddd;">Total Amount:</td>
                                <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">$${totalAmountWithShipping.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 style="color: #555;">Shipping Information</h3>
                    <p><strong>Method:</strong> Standard Shipping</p>
                    <p><strong>Estimated Delivery:</strong> 6/23/2025</p>
                    <p><strong>Tracking Number:</strong> TEST123456789</p>
                    <p><strong>Shipping Address:</strong> ${shippingAddress}</p>

                    <h3 style="color: #555;">Payment Information</h3>
                    <p><strong>Payment Method:</strong> Credit Card</p>
                    <p><strong>Payment Status:</strong> Paid</p>

                    <p style="text-align: center; margin-top: 30px; font-size: 0.9em; color: #777;">Thank you for shopping with us!</p>
                </div>
            `;

            await sendEmail({
                to: user.email,
                subject: 'Order Confirmation',
                html: emailHtml
            });
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 
