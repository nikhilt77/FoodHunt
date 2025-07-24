import { Request, Response } from 'express';
import Payment from '../models/Payment';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, type, description } = req.body;
    const userId = req.user._id;

    const payment = new Payment({
      userId,
      amount,
      type,
      description,
      transactionId: `TXN${Date.now()}`
    });

    await payment.save();

    // Update user dues if it's a credit payment
    if (type === 'credit') {
      await User.findByIdAndUpdate(userId, { $inc: { dues: -amount } });
    } else if (type === 'debit') {
      await User.findByIdAndUpdate(userId, { $inc: { dues: amount } });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Payment recorded successfully', 
      data: payment 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating payment', 
      error: error 
    });
  }
};

export const getUserPayments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching payments', 
      error: error 
    });
  }
};

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email rollNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching payments', 
      error: error 
    });
  }
};
