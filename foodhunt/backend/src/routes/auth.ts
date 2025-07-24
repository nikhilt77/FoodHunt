import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  addBalance,
  authValidation
} from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', authValidation.register, validateRequest, register);
router.post('/login', authValidation.login, validateRequest, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Admin/Staff routes
router.post('/add-balance/:userId?', authenticate, authorize('admin', 'staff'), addBalance);

export default router;
