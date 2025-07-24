import express from 'express';
import { 
  createReservation, 
  getUserReservations, 
  getAllReservations, 
  updateReservationStatus 
} from '../controllers/reservationController';
import { authorize } from '../middleware/auth';

const router = express.Router();

router.post('/', createReservation);
router.get('/', getUserReservations);
router.get('/all', authorize(['admin']), getAllReservations);
router.put('/:id/status', authorize(['admin']), updateReservationStatus);

export default router;
