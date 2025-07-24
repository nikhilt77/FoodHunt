import { Router } from 'express';
import {
  getAllFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  migrateFoodItemsEndpoint,
  foodValidation
} from '../controllers/foodController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Public routes (for browsing menu)
router.get('/', getAllFoodItems);
router.get('/:id', getFoodItemById);

// Admin/Staff routes
router.post('/', authenticate, authorize('admin', 'staff'), foodValidation.create, validateRequest, createFoodItem);
router.put('/:id', authenticate, authorize('admin', 'staff'), updateFoodItem);
router.delete('/:id', authenticate, authorize('admin', 'staff'), deleteFoodItem);
router.post('/migrate', authenticate, authorize('admin'), migrateFoodItemsEndpoint);

export default router;
