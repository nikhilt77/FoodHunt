import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, rollNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'student',
      rollNumber: role === 'student' ? rollNumber : undefined
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          rollNumber: user.rollNumber,
          dues: user.dues
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          rollNumber: user.rollNumber,
          dues: user.dues
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const updateDues = async (req: Request, res: Response) => {
  try {
    const { userId, amount, operation } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (operation === 'add') {
      user.dues += amount;
    } else if (operation === 'subtract') {
      user.dues = Math.max(0, user.dues - amount);
    }

    await user.save();

    res.json({ success: true, message: 'Dues updated successfully', data: { dues: user.dues } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
