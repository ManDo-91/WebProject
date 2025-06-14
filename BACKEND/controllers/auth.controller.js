const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { sendEmail } = require('../utils/email');
const logger = require('../utils/logger');

const authController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { email, username, password, firstName, lastName } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ 
                $or: [{ email }, { username }] 
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'User with this email or username already exists' 
                });
            }

            // Create verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

            // Create new user
            const user = new User({
                email,
                username,
                password,
                firstName,
                lastName,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires
            });

            await user.save();

            // Send verification email
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
            await sendEmail({
                to: email,
                subject: 'Verify your email',
                html: `Please click <a href="${verificationUrl}">here</a> to verify your email.`
            });

            logger.info(`New user registered: ${user._id}`);
            res.status(201).json({ 
                message: 'Registration successful. Please check your email to verify your account.' 
            });
        } catch (error) {
            logger.error('Registration error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check if account is locked
            if (user.isLocked()) {
                return res.status(401).json({ 
                    message: 'Account is locked. Please try again later.' 
                });
            }

            // Verify password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                await user.incrementLoginAttempts();
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Reset login attempts on successful login
            await user.resetLoginAttempts();

            // Update last login
            user.lastLogin = Date.now();
            await user.save();

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user._id,
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set refresh token
            const refreshToken = jwt.sign(
                { id: user._id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                refreshToken,
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Verify email
    verifyEmail: async (req, res) => {
        try {
            const { token } = req.params;

            const user = await User.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ 
                    message: 'Invalid or expired verification token' 
                });
            }

            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();

            res.json({ message: 'Email verified successfully' });
        } catch (error) {
            logger.error('Email verification error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Request password reset
    requestPasswordReset: async (req, res) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

            user.passwordResetToken = resetToken;
            user.passwordResetExpires = resetExpires;
            await user.save();

            // Send reset email
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            await sendEmail({
                to: email,
                subject: 'Password Reset Request',
                html: `Please click <a href="${resetUrl}">here</a> to reset your password.`
            });

            res.json({ message: 'Password reset email sent' });
        } catch (error) {
            logger.error('Password reset request error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Reset password
    resetPassword: async (req, res) => {
        try {
            const { token, password } = req.body;

            const user = await User.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ 
                    message: 'Invalid or expired reset token' 
                });
            }

            user.password = password;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            user.lastPasswordChange = Date.now();
            await user.save();

            res.json({ message: 'Password reset successful' });
        } catch (error) {
            logger.error('Password reset error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Refresh token
    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({ message: 'Refresh token required' });
            }

            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            const token = jwt.sign(
                { 
                    id: user._id,
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ token });
        } catch (error) {
            logger.error('Token refresh error:', error);
            res.status(401).json({ message: 'Invalid refresh token' });
        }
    },

    // Logout
    logout: async (req, res) => {
        try {
            // In a real application, you might want to blacklist the token
            // or implement token revocation
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            logger.error('Logout error:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = authController; 