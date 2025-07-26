"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBalance = exports.updateProfile = exports.getProfile = exports.login = exports.register = exports.authValidation = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const Transaction_1 = require("../models/Transaction");
exports.authValidation = {
    register: [
        (0, express_validator_1.body)('studentId').notEmpty().withMessage('Student ID is required'),
        (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
        (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
        (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        (0, express_validator_1.body)('department').optional().trim(),
        (0, express_validator_1.body)('year').optional().isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4')
    ],
    login: [
        (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
        (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
    ]
};
const register = async (req, res) => {
    try {
        const { studentId, name, email, password, department, year } = req.body;
        const existingUser = await User_1.User.findOne({
            $or: [{ email }, { studentId }]
        });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email or student ID'
            });
        }
        const user = new User_1.User({
            studentId,
            name,
            email,
            password,
            department,
            year
        });
        await user.save();
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not defined');
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        const jwtExpiry = process.env.JWT_EXPIRES_IN || '7d';
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: jwtExpiry });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email, isActive: true });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Calculate totalDues from pending orders
        const { Order } = require('../models/Order');
        const pendingOrders = await Order.find({
            userId: user._id,
            paymentStatus: 'pending'
        });
        const totalDues = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        // Create user object with totalDues
        const userWithDues = {
            ...user.toJSON(),
            totalDues
        };
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not defined');
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        const jwtExpiry = process.env.JWT_EXPIRES_IN || '7d';
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: jwtExpiry });
        res.json({
            message: 'Login successful',
            token,
            user: userWithDues
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Calculate totalDues from pending orders
        const { Order } = require('../models/Order');
        const pendingOrders = await Order.find({
            userId: req.user._id,
            paymentStatus: 'pending'
        });
        const totalDues = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        // Create user object with totalDues
        const userWithDues = {
            ...user.toJSON(),
            totalDues
        };
        res.json(userWithDues);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name, department, year } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.user._id, { name, department, year }, { new: true, runValidators: true });
        res.json({ message: 'Profile updated successfully', user });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateProfile = updateProfile;
const addBalance = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.params.userId || req.user._id;
        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const balanceBefore = user.balance;
        user.balance += amount;
        await user.save();
        // Record transaction
        const transaction = new Transaction_1.Transaction({
            userId,
            type: 'credit',
            amount,
            description: 'Balance top-up',
            balanceBefore,
            balanceAfter: user.balance
        });
        await transaction.save();
        res.json({
            message: 'Balance added successfully',
            user,
            transaction
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.addBalance = addBalance;
//# sourceMappingURL=authController.js.map