import express from 'express';
import { 
  createStock, 
  getAllStock, 
  updateStock, 
  deleteStock 
} from '../controllers/stockController';
import { authorize } from '../middleware/auth';

const router = express.Router();

// Admin only routes
router.post('/', authorize(['admin']), createStock);
router.get('/', getAllStock);
router.put('/:id', authorize(['admin']), updateStock);
router.delete('/:id', authorize(['admin']), deleteStock);

export default router;
