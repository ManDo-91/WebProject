const nodemailer = require('nodemailer');
const { logger } = require('./logger');
const config = require('../config');

// Create reusable transporter
const transporter = nodemailer.createTransport(config.email);

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        logger.error('SMTP connection error:', { 
            error: error.message,
            user: config.email.auth.user,
            pass: config.email.auth.pass
        });
    } else {
        logger.info('SMTP server is ready to take messages');
    }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} [options.html] - HTML content
 * @returns {Promise} - Promise resolving to info about sent email
 */
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `"${config.email.fromName}" <${config.email.auth.user}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info('Email sent:', info.messageId);
        return info;
    } catch (error) {
        logger.error('Email sending error:', error);
        throw error;
    }
};

/**
 * Send a password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @returns {Promise} - Promise resolving to info about sent email
 */
const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const text = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    const html = `
        <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p>Please click on the following link to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    return sendEmail({
        to: email,
        subject: 'Password Reset Request',
        text,
        html
    });
};

/**
 * Send a welcome email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @returns {Promise} - Promise resolving to info about sent email
 */
const sendWelcomeEmail = async (email, name) => {
    const text = `Welcome to our platform, ${name}! We're excited to have you on board.`;
    const html = `
        <h1>Welcome to our platform!</h1>
        <p>Hello ${name},</p>
        <p>We're excited to have you on board. Thank you for joining us!</p>
        <p>If you have any questions, feel free to contact our support team.</p>
    `;

    return sendEmail({
        to: email,
        subject: 'Welcome to Our Platform',
        text,
        html
    });
};

/**
 * Send an order confirmation email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {Object} order - Order details
 * @returns {Promise} - Promise resolving to info about sent email
 */
const sendOrderConfirmationEmail = async (email, name, order) => {
    const itemsList = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${item.product.name}</td>
            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="padding: 10px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const text = `Thank you for your order, ${name}! Your order #${order._id} has been received.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <h1 style="color: #2c3e50; margin: 0 0 20px 0; text-align: center;">Order Confirmation</h1>
                <p style="margin: 0 0 10px 0;">Hello ${name},</p>
                <p style="margin: 0 0 20px 0;">Thank you for your order! We're pleased to confirm that we've received your order #${order._id}.</p>
            </div>

            <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #2c3e50; margin: 0 0 15px 0;">Order Details</h2>
                <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> ${order._id}</p>
                <p style="margin: 0 0 10px 0;"><strong>Order Date:</strong> ${orderDate}</p>
                <p style="margin: 0 0 20px 0;"><strong>Status:</strong> <span style="color: #27ae60;">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></p>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 10px; text-align: left;">Product</th>
                            <th style="padding: 10px; text-align: center;">Quantity</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                            <th style="padding: 10px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsList}
                    </tbody>
                    <tfoot>
                        <tr style="border-top: 2px solid #eee;">
                            <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total Amount:</strong></td>
                            <td style="padding: 10px; text-align: right;"><strong>$${order.total.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin: 0 0 15px 0;">What's Next?</h3>
                <ol style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">We'll process your order and prepare it for shipping.</li>
                    <li style="margin-bottom: 10px;">You'll receive another email when your order ships.</li>
                    <li style="margin-bottom: 10px;">Track your order status in your account dashboard.</li>
                </ol>
            </div>

            <div style="background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; font-size: 14px; color: #666;">
                <p style="margin: 0 0 10px 0;">If you have any questions about your order, please contact our support team.</p>
                <p style="margin: 0;">Thank you for shopping with us!</p>
            </div>

            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                <p style="margin: 0;">This is an automated email, please do not reply directly to this message.</p>
            </div>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: `Order Confirmation - Order #${order._id}`,
        text,
        html
    });
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendOrderConfirmationEmail
}; 
