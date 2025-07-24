import { Router, Request, Response } from 'express';
import { Order } from '../models/Order';
import { FoodItem } from '../models/FoodItem';
import { authenticate } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();

// Create a reservation (order) - Student functionality
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { foodItemId, quantity, preferredPickupTime, notes } = req.body;
    const userId = req.user?.userId || req.user?.id;

    // Get the food item to calculate total amount
    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (!foodItem.isAvailable) {
      return res.status(400).json({ message: 'Food item is not available' });
    }

    // Check stock availability
    if (foodItem.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${foodItem.stock} items available.` 
      });
    }

    const totalAmount = foodItem.price * quantity;

    // Create the order
    const order = new Order({
      userId,
      items: [{
        foodItemId,
        quantity,
        price: foodItem.price
      }],
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'balance',
      notes: notes || ''
    });

    await order.save();

    // Update stock
    foodItem.stock -= quantity;
    await foodItem.save();

    res.status(201).json({
      message: 'Reservation created successfully',
      order: order
    });

  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Failed to create reservation' });
  }
});

// Get user's reservations
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    // Get food item details for each order
    const reservations = await Promise.all(orders.map(async (order) => {
      const foodItem = await FoodItem.findById(order.items[0]?.foodItemId);
      
      return {
        _id: order._id,
        foodItemId: order.items[0]?.foodItemId,
        quantity: order.items[0]?.quantity || 1,
        totalAmount: order.totalAmount,
        status: order.status,
        reservationDate: order.createdAt,
        preferredPickupTime: order.createdAt,
        paymentStatus: order.paymentStatus,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        foodItem: {
          name: foodItem?.name || 'Unknown',
          description: foodItem?.description || '',
          price: foodItem?.price || 0,
          category: foodItem?.category || 'snacks',
        }
      };
    }));

    res.json({
      message: 'Reservations retrieved successfully',
      reservations
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Failed to fetch reservations' });
  }
});

export default router;
