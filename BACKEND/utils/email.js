const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        logger.error('SMTP connection error:', error);
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
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
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

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
}; 