import express from 'express';
import { 
  register, 
  login, 
  getProfile,
  updateProfile,
  addBalance,
  authValidation
} from '../controllers/authController';
import { 
  createPayment, 
  getUserPayments, 
  getAllPayments,
  getUserDues,
  getUserBalance
} from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Auth routes
router.post('/register', authValidation.register, register);
router.post('/login', authValidation.login, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Payment routes  
router.post('/payments', authenticate, createPayment);
router.get('/payments', authenticate, getUserPayments);
router.get('/payments/all', authenticate, authorize('admin'), getAllPayments);
router.get('/balance', authenticate, getUserBalance);
router.get('/dues', authenticate, getUserDues);

// Admin only routes
router.post('/add-balance/:userId?', authenticate, authorize('admin', 'staff'), addBalance);

export default router;
