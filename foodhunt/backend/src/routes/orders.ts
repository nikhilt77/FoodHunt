import { Router } from 'express';
import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { FoodItem } from '../models/FoodItem';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { authenticate } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();

// Validation for creating an order
export const orderValidation = {
  create: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.foodItemId')
      .isMongoId()
      .withMessage('Valid food item ID is required'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('orderType')
      .optional()
      .isIn(['immediate', 'scheduled'])
      .withMessage('Order type must be immediate or scheduled'),
    body('scheduledTime')
      .optional()
      .isISO8601()
      .withMessage('Scheduled time must be a valid date'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ]
};

// Create a new order with multiple items
router.post('/', authenticate, orderValidation.create, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
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
    const foodItemIds = items.map((item: any) => item.foodItemId);
    const foodItems = await FoodItem.find({ 
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
    const order = new Order({
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
      await FoodItem.findByIdAndUpdate(
        requestedItem.foodItemId,
        { $inc: { stock: -requestedItem.quantity } }
      );
    }

    // Populate the order with food item details
    const populatedOrder = await Order.findById(order._id)
      .populate('items.foodItemId', 'name category price preparationTime')
      .populate('userId', 'name studentId department');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Get user's orders
router.get('/my-orders', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, limit = 10, page = 1 } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.foodItemId', 'name category price preparationTime')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalOrders = await Order.countDocuments(query);

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

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get specific order details
router.get('/:orderId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    const order = await Order.findOne({ _id: orderId, userId })
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

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
});

// Cancel an order (only if status is pending)
router.patch('/:orderId/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    const order = await Order.findOne({ _id: orderId, userId });

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
      await FoodItem.findByIdAndUpdate(
        item.foodItemId,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

// Admin routes for managing orders
router.get('/admin/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status, date, limit = 50, page = 1 } = req.query;
    
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    // Filter out orders with invalid user IDs
    query.userId = { $regex: /^[0-9a-fA-F]{24}$/ };

    const orders = await Order.find(query)
      .populate('items.foodItemId', 'name category price')
      .populate('userId', 'name studentId department')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalOrders = await Order.countDocuments(query);

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

  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Admin: Update order status
router.patch('/admin/:orderId/status', authenticate, async (req: AuthRequest, res: Response) => {
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

    // Get the order with populated food items to calculate preparation time
    const existingOrder = await Order.findById(orderId).populate('items.foodItemId', 'name category preparationTime');
    
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Calculate estimated ready time when order starts preparing
    let updateData: any = { status };
    
    if (status === 'preparing') {
      const now = new Date();
      updateData.preparationStartedAt = now;
      
      // Calculate maximum preparation time from all items in the order
      const maxPrepTime = Math.max(...existingOrder.items.map(item => 
        (item.foodItemId as any).preparationTime || 0
      ));
      
      // Add preparation time to current time
      const estimatedReadyTime = new Date(now.getTime() + maxPrepTime * 60000); // Convert minutes to milliseconds
      updateData.estimatedReadyTime = estimatedReadyTime;
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('items.foodItemId', 'name category preparationTime')
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

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// Auto-update orders that are ready (called periodically)
router.patch('/admin/auto-update-ready', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const now = new Date();
    
    // Find all orders that are preparing and past their estimated ready time
    const ordersToUpdate = await Order.updateMany(
      {
        status: 'preparing',
        estimatedReadyTime: { $lte: now }
      },
      {
        status: 'ready'
      }
    );

    res.json({
      success: true,
      message: `Updated ${ordersToUpdate.modifiedCount} orders to ready status`,
      modifiedCount: ordersToUpdate.modifiedCount
    });

  } catch (error) {
    console.error('Error auto-updating orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to auto-update orders'
    });
  }
});

// Test endpoint for auto-update without authentication (for testing)
router.get('/test/auto-update-ready', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    // Find all orders that are preparing and past their estimated ready time
    const preparingOrders = await Order.find({
      status: 'preparing',
      estimatedReadyTime: { $exists: true }
    });

    const readyOrders = preparingOrders.filter(order => 
      order.estimatedReadyTime && order.estimatedReadyTime <= now
    );

    // Update orders that are ready
    const ordersToUpdate = await Order.updateMany(
      {
        status: 'preparing',
        estimatedReadyTime: { $lte: now }
      },
      {
        status: 'ready'
      }
    );

    res.json({
      success: true,
      message: `Auto-update check complete`,
      currentTime: now,
      preparingOrdersFound: preparingOrders.length,
      readyOrdersFound: readyOrders.length,
      ordersUpdated: ordersToUpdate.modifiedCount,
      preparingOrders: preparingOrders.map(order => ({
        id: order._id,
        status: order.status,
        preparationStartedAt: order.preparationStartedAt,
        estimatedReadyTime: order.estimatedReadyTime,
        isReady: order.estimatedReadyTime && order.estimatedReadyTime <= now
      }))
    });

  } catch (error) {
    console.error('Error testing auto-update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test auto-update'
    });
  }
});

// Update order payment status
router.patch('/:orderId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, paymentMethod, status } = req.body;
    const userId = req.user?.id;

    // Build update object
    const updateData: any = {};
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (status) updateData.status = status;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      updateData,
      { new: true }
    ).populate('items.foodItemId', 'name category')
     .populate('userId', 'name studentId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
});

export default router;
