"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const Order_1 = require("../models/Order");
const Transaction_1 = require("../models/Transaction");
const FoodItem_1 = require("../models/FoodItem");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all menu items for admin
router.get('/menu', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const foodItems = await FoodItem_1.FoodItem.find({}).sort({ createdAt: -1 });
        console.log('Admin menu endpoint called, returning', foodItems.length, 'items');
        console.log('First item:', foodItems[0]?.name || 'No items');
        res.json({
            success: true,
            data: foodItems
        });
    }
    catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu items'
        });
    }
});
// Admin menu management endpoints
router.post('/menu', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { name, description, price, category, preparationTime, maxDailyStock } = req.body;
        const foodItem = new FoodItem_1.FoodItem({
            name,
            description,
            price,
            category,
            preparationTime,
            stock: maxDailyStock, // Start with full stock
            maxDailyStock,
            isAvailable: true
        });
        await foodItem.save();
        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: foodItem
        });
    }
    catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create menu item'
        });
    }
});
// Update food item stock
router.patch('/menu/:id/stock', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        const foodItem = await FoodItem_1.FoodItem.findByIdAndUpdate(id, { stock }, { new: true });
        if (!foodItem) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }
        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: foodItem
        });
    }
    catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stock'
        });
    }
});
// Update food item availability
router.patch('/menu/:id/availability', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { isAvailable } = req.body;
        const foodItem = await FoodItem_1.FoodItem.findByIdAndUpdate(id, { isAvailable }, { new: true });
        if (!foodItem) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }
        res.json({
            success: true,
            message: 'Availability updated successfully',
            data: foodItem
        });
    }
    catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update availability'
        });
    }
});
// Get all students with their dues
router.get('/students/dues', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        // Get all students with their pending orders (unpaid orders)
        const studentsWithDues = await User_1.User.aggregate([
            {
                $match: { role: 'student' }
            },
            {
                $addFields: {
                    userIdString: { $toString: '$_id' }
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'userIdString',
                    foreignField: 'userId',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    totalDues: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$orders',
                                        cond: { $eq: ['$$this.paymentStatus', 'pending'] }
                                    }
                                },
                                as: 'order',
                                in: '$$order.totalAmount'
                            }
                        }
                    },
                    pendingOrders: {
                        $filter: {
                            input: '$orders',
                            cond: { $eq: ['$$this.paymentStatus', 'pending'] }
                        }
                    }
                }
            },
            {
                $match: {
                    totalDues: { $gt: 0 }
                }
            },
            {
                $sort: { totalDues: -1 }
            },
            {
                $project: {
                    password: 0,
                    orders: 0,
                    userIdString: 0
                }
            }
        ]);
        res.json({
            success: true,
            data: studentsWithDues
        });
    }
    catch (error) {
        console.error('Error fetching student dues:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student dues'
        });
    }
});
// Get detailed dues for a specific student
router.get('/students/:studentId/dues', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await User_1.User.findById(studentId).select('-password');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        const pendingOrders = await Order_1.Order.find({
            userId: studentId,
            paymentStatus: 'pending'
        }).populate('items.foodItemId', 'name category')
            .sort({ createdAt: -1 });
        const totalDues = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        res.json({
            success: true,
            data: {
                student,
                pendingOrders,
                totalDues
            }
        });
    }
    catch (error) {
        console.error('Error fetching student dues details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student dues details'
        });
    }
});
// Mark specific orders as paid
router.post('/students/:studentId/mark-paid', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { orderIds, paymentMethod = 'cash' } = req.body;
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order IDs are required'
            });
        }
        // Update orders to paid status
        const updatedOrders = await Order_1.Order.updateMany({
            _id: { $in: orderIds },
            userId: studentId,
            paymentStatus: 'pending'
        }, {
            $set: {
                paymentStatus: 'paid',
                paymentMethod: paymentMethod
            }
        });
        if (updatedOrders.modifiedCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'No pending orders found to mark as paid'
            });
        }
        // Create transaction records for the payments
        const orders = await Order_1.Order.find({ _id: { $in: orderIds } });
        const user = await User_1.User.findById(studentId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        // Create transaction records
        const transactions = orders.map(order => ({
            userId: studentId,
            type: 'debit',
            amount: order.totalAmount,
            description: `Payment for order ${order._id} - ${paymentMethod}`,
            orderId: order._id,
            balanceBefore: user.balance,
            balanceAfter: user.balance
        }));
        await Transaction_1.Transaction.insertMany(transactions);
        res.json({
            success: true,
            message: `Successfully marked ${updatedOrders.modifiedCount} order(s) as paid`,
            data: {
                modifiedCount: updatedOrders.modifiedCount,
                totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0)
            }
        });
    }
    catch (error) {
        console.error('Error marking orders as paid:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark orders as paid'
        });
    }
});
// Mark all dues as paid for a student
router.post('/students/:studentId/mark-all-paid', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { paymentMethod = 'cash' } = req.body;
        // Get all pending orders for the student
        const pendingOrders = await Order_1.Order.find({
            userId: studentId,
            paymentStatus: 'pending'
        });
        if (pendingOrders.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No pending dues found for this student'
            });
        }
        const orderIds = pendingOrders.map(order => order._id);
        const totalAmount = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        // Update all pending orders to paid
        await Order_1.Order.updateMany({
            userId: studentId,
            paymentStatus: 'pending'
        }, {
            $set: {
                paymentStatus: 'paid',
                paymentMethod: paymentMethod
            }
        });
        // Create a single transaction record for all payments
        const user = await User_1.User.findById(studentId);
        if (user) {
            await Transaction_1.Transaction.create({
                userId: studentId,
                type: 'debit',
                amount: totalAmount,
                description: `Payment for all pending dues (${pendingOrders.length} orders) - ${paymentMethod}`,
                balanceBefore: user.balance,
                balanceAfter: user.balance
            });
        }
        res.json({
            success: true,
            message: `Successfully marked all dues as paid for ${user?.name}`,
            data: {
                ordersCount: pendingOrders.length,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod
            }
        });
    }
    catch (error) {
        console.error('Error marking all dues as paid:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all dues as paid'
        });
    }
});
// Get all reservations (orders) for admin - this is what the frontend expects
router.get('/reservations', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        // First get orders with valid ObjectId userIds only
        const mongoose = require('mongoose');
        const reservations = await Order_1.Order.find({
            userId: { $regex: /^[0-9a-fA-F]{24}$/ } // Only valid ObjectIds
        })
            .populate('userId', 'name studentId department')
            .populate('items.foodItemId', 'name category')
            .sort({ createdAt: -1 });
        // Transform the data to match the frontend interface
        const transformedReservations = reservations
            .filter(order => order.userId) // Filter out orders where population failed
            .map(order => ({
            _id: order._id,
            userId: order.userId,
            foodItemId: order.items[0]?.foodItemId, // For compatibility with single-item frontend
            quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: order.totalAmount,
            status: order.status,
            reservationDate: order.createdAt,
            preferredPickupTime: order.scheduledTime || order.createdAt,
            user: {
                name: order.userId.name,
                studentId: order.userId.studentId,
                department: order.userId.department
            },
            foodItem: {
                name: order.items.length === 1 ? order.items[0].foodItemId.name : `${order.items.length} items`,
                category: order.items.length === 1 ? order.items[0].foodItemId.category : 'mixed'
            },
            items: order.items // Include all items for new multi-item support
        }));
        res.json({
            success: true,
            reservations: transformedReservations
        });
    }
    catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservations'
        });
    }
});
// Update reservation/order status
router.patch('/reservations/:id/status', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['pending', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        const order = await Order_1.Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        res.json({
            success: true,
            message: 'Status updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map