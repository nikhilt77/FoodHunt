"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderValidation = void 0;
const express_1 = require("express");
const Order_1 = require("../models/Order");
const FoodItem_1 = require("../models/FoodItem");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Validation for creating an order
exports.orderValidation = {
    create: [
        (0, express_validator_1.body)('items')
            .isArray({ min: 1 })
            .withMessage('At least one item is required'),
        (0, express_validator_1.body)('items.*.foodItemId')
            .isMongoId()
            .withMessage('Valid food item ID is required'),
        (0, express_validator_1.body)('items.*.quantity')
            .isInt({ min: 1 })
            .withMessage('Quantity must be at least 1'),
        (0, express_validator_1.body)('orderType')
            .optional()
            .isIn(['immediate', 'scheduled'])
            .withMessage('Order type must be immediate or scheduled'),
        (0, express_validator_1.body)('scheduledTime')
            .optional()
            .isISO8601()
            .withMessage('Scheduled time must be a valid date'),
        (0, express_validator_1.body)('notes')
            .optional()
            .isLength({ max: 500 })
            .withMessage('Notes cannot exceed 500 characters')
    ]
};
// Create a new order with multiple items
router.post('/', auth_1.authenticate, exports.orderValidation.create, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }
        const { items, orderType = 'immediate', scheduledTime, notes } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        // Validate all food items exist and are available
        const foodItemIds = items.map((item) => item.foodItemId);
        const foodItems = await FoodItem_1.FoodItem.find({
            _id: { $in: foodItemIds },
            isAvailable: true
        });
        if (foodItems.length !== foodItemIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some food items are not available or do not exist'
            });
        }
        // Calculate total amount and validate stock
        let totalAmount = 0;
        const orderItems = [];
        for (const requestedItem of items) {
            const foodItem = foodItems.find(fi => fi._id.toString() === requestedItem.foodItemId);
            if (!foodItem) {
                return res.status(400).json({
                    success: false,
                    message: `Food item ${requestedItem.foodItemId} not found`
                });
            }
            // Check if there's enough stock
            if (foodItem.stock < requestedItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${foodItem.name}. Available: ${foodItem.stock}, Requested: ${requestedItem.quantity}`
                });
            }
            const itemTotal = foodItem.price * requestedItem.quantity;
            totalAmount += itemTotal;
            orderItems.push({
                foodItemId: requestedItem.foodItemId,
                quantity: requestedItem.quantity,
                price: foodItem.price
            });
        }
        // Create the order
        const order = new Order_1.Order({
            userId,
            items: orderItems,
            totalAmount,
            status: 'pending',
            orderType,
            scheduledTime: orderType === 'scheduled' ? new Date(scheduledTime) : undefined,
            paymentStatus: 'pending',
            paymentMethod: 'balance', // Default to balance, can be changed later
            notes
        });
        await order.save();
        // Update stock for all items
        for (const requestedItem of items) {
            await FoodItem_1.FoodItem.findByIdAndUpdate(requestedItem.foodItemId, { $inc: { stock: -requestedItem.quantity } });
        }
        // Populate the order with food item details
        const populatedOrder = await Order_1.Order.findById(order._id)
            .populate('items.foodItemId', 'name category price preparationTime')
            .populate('userId', 'name studentId department');
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: populatedOrder
        });
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    }
});
// Get user's orders
router.get('/my-orders', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { status, limit = 10, page = 1 } = req.query;
        const query = { userId };
        if (status) {
            query.status = status;
        }
        const orders = await Order_1.Order.find(query)
            .populate('items.foodItemId', 'name category price preparationTime')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const totalOrders = await Order_1.Order.countDocuments(query);
        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalOrders / Number(limit)),
                totalOrders,
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
});
// Get specific order details
router.get('/:orderId', auth_1.authenticate, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user?.id;
        const order = await Order_1.Order.findOne({ _id: orderId, userId })
            .populate('items.foodItemId', 'name category price preparationTime description')
            .populate('userId', 'name studentId department');
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        res.json({
            success: true,
            data: order
        });
    }
    catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order details'
        });
    }
});
// Cancel an order (only if status is pending)
router.patch('/:orderId/cancel', auth_1.authenticate, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user?.id;
        const order = await Order_1.Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending orders can be cancelled'
            });
        }
        // Update order status
        order.status = 'cancelled';
        await order.save();
        // Restore stock for all items
        for (const item of order.items) {
            await FoodItem_1.FoodItem.findByIdAndUpdate(item.foodItemId, { $inc: { stock: item.quantity } });
        }
        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    }
    catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order'
        });
    }
});
// Admin routes for managing orders
router.get('/admin/all', auth_1.authenticate, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        const { status, date, limit = 50, page = 1 } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            query.createdAt = { $gte: startDate, $lt: endDate };
        }
        const orders = await Order_1.Order.find(query)
            .populate('items.foodItemId', 'name category price')
            .populate('userId', 'name studentId department')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const totalOrders = await Order_1.Order.countDocuments(query);
        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalOrders / Number(limit)),
                totalOrders,
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
});
// Admin: Update order status
router.patch('/admin/:orderId/status', auth_1.authenticate, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        const { orderId } = req.params;
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        const order = await Order_1.Order.findByIdAndUpdate(orderId, { status }, { new: true }).populate('items.foodItemId', 'name category')
            .populate('userId', 'name studentId');
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
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
//# sourceMappingURL=orders.js.map