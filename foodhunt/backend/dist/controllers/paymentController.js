"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDues = exports.getUserBalance = exports.getAllPayments = exports.getUserPayments = exports.createPayment = void 0;
const Payment_1 = require("../models/Payment");
const User_1 = require("../models/User");
const Transaction_1 = require("../models/Transaction");
const createPayment = async (req, res) => {
    try {
        const { amount, type, description, orderId } = req.body;
        const userId = req.user._id;
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number'
            });
        }
        if (!type || !['credit', 'debit'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Type must be either credit or debit'
            });
        }
        // Get current user
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const balanceBefore = user.balance;
        // Update user balance
        if (type === 'credit') {
            user.balance += amount;
        }
        else if (type === 'debit') {
            if (user.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient balance'
                });
            }
            user.balance -= amount;
        }
        await user.save();
        // Create payment record
        const payment = new Payment_1.Payment({
            userId,
            amount,
            type,
            description: description || (type === 'credit' ? 'Wallet top-up' : 'Payment'),
            reservationId: orderId,
            transactionId: `TXN${Date.now()}`
        });
        await payment.save();
        // Create transaction record
        const transaction = new Transaction_1.Transaction({
            userId,
            type,
            amount,
            description: payment.description,
            orderId,
            balanceBefore,
            balanceAfter: user.balance
        });
        await transaction.save();
        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: {
                payment,
                newBalance: user.balance
            }
        });
    }
    catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment',
            error: error
        });
    }
};
exports.createPayment = createPayment;
const getUserPayments = async (req, res) => {
    try {
        const userId = req.user._id;
        const payments = await Payment_1.Payment.find({ userId })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: payments });
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments',
            error: error
        });
    }
};
exports.getUserPayments = getUserPayments;
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment_1.Payment.find()
            .populate('userId', 'name email studentId')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: payments });
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments',
            error: error
        });
    }
};
exports.getAllPayments = getAllPayments;
const getUserBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User_1.User.findById(userId).select('balance');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            data: {
                balance: user.balance
            }
        });
    }
    catch (error) {
        console.error('Error fetching user balance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching balance',
            error: error
        });
    }
};
exports.getUserBalance = getUserBalance;
const getUserDues = async (req, res) => {
    try {
        const userId = req.user._id;
        const { Order } = require('../models/Order');
        // Get all pending orders for the user
        const pendingOrders = await Order.find({
            userId,
            paymentStatus: 'pending'
        }).populate('items.foodItemId', 'name category price');
        const totalDues = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        res.json({
            success: true,
            data: {
                totalDues,
                pendingOrders,
                orderCount: pendingOrders.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching user dues:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dues',
            error: error
        });
    }
};
exports.getUserDues = getUserDues;
//# sourceMappingURL=paymentController.js.map