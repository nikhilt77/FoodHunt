import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { body } from 'express-validator';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';

interface AuthRequest extends Request {
  user?: any;
}

export const authValidation = {
  register: [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('department').optional().trim(),
    body('year').optional().isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4')
  ],
  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

export const register = async (req: Request, res: Response) => {
  try {
    const { studentId, name, email, password, department, year } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or student ID'
      });
    }

    const user = new User({
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
    const JWT_SECRET: Secret = process.env.JWT_SECRET;
    const jwtExpiry = process.env.JWT_EXPIRES_IN || '7d';
    
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: jwtExpiry } as SignOptions
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Calculate totalDues from pending orders
    const { Order } = require('../models/Order');
    const pendingOrders = await Order.find({
      userId: user._id,
      paymentStatus: 'pending'
    });
    
    const totalDues = pendingOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

    // Create user object with totalDues
    const userWithDues = {
      ...user.toJSON(),
      totalDues
    };

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not defined');
    }
    const JWT_SECRET: Secret = process.env.JWT_SECRET;
    const jwtExpiry = process.env.JWT_EXPIRES_IN || '7d';
    
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: jwtExpiry } as SignOptions
    );

    res.json({
      message: 'Login successful',
      token,
      user: userWithDues
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate totalDues from pending orders
    const { Order } = require('../models/Order');
    const pendingOrders = await Order.find({
      userId: req.user._id,
      paymentStatus: 'pending'
    });
    
    const totalDues = pendingOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

    // Create user object with totalDues
    const userWithDues = {
      ...user.toJSON(),
      totalDues
    };

    res.json(userWithDues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, department, year } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department, year },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addBalance = async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = req.params.userId || req.user._id;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const balanceBefore = user.balance;
    user.balance += amount;
    await user.save();

    // Record transaction
    const transaction = new Transaction({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
