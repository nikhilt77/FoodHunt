import express from 'express';
import { 
  createPayment, 
  getUserPayments, 
  getAllPayments 
} from '../controllers/paymentController';
import { authorize } from '../middleware/auth';

const router = express.Router();

router.post('/', createPayment);
router.get('/', getUserPayments);
router.get('/all', authorize(['admin']), getAllPayments);

export default router;
