import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  getAllStudents, 
  updateDues 
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.get('/students', authenticate, authorize(['admin']), getAllStudents);
router.put('/dues', authenticate, authorize(['admin']), updateDues);

export default router;
