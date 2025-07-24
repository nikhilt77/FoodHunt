import { Router, Request, Response } from 'express';
import { Order } from '../models/Order';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();

// Middleware to simulate authentication for now
const authenticate = (req: AuthRequest, res: Response, next: any) => {
  // For now, we'll simulate a logged-in user
  req.user = { id: 'temp-user-id' };
  next();
};

// Get dues summary for the current user
router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'temp-user-id';

    // Get all pending orders for the user
    const pendingOrders = await Order.find({ 
      userId,
      paymentStatus: 'pending'
    });

    // Calculate totals
    const totalDues = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingPayments = pendingOrders.length;
    
    // Find the nearest due date (assuming 7 days from order creation)
    let nextDueDate = null;
    if (pendingOrders.length > 0) {
      const oldestOrder = pendingOrders.sort((a, b) => 
        new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
      )[0];
      
      nextDueDate = new Date(oldestOrder.createdAt!.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Count overdue payments (orders older than 7 days)
    const overduePayments = pendingOrders.filter(order => {
      const orderDate = new Date(order.createdAt!);
      const dueDate = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate < new Date();
    }).length;

    res.json({
      totalDues,
      pendingPayments,
      overduePayments,
      nextDueDate
    });

  } catch (error) {
    console.error('Error fetching dues summary:', error);
    res.status(500).json({ message: 'Failed to fetch dues summary' });
  }
});

export default router;
