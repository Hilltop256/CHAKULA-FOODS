import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAvailableTables,
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservationStatus,
  cancelReservation,
  getAllReservations,
} from '../controllers/tableController';

const router = Router();

// Public: check availability
router.get('/available-tables', getAvailableTables);

// Customer routes
router.post('/', authenticate, createReservation);
router.get('/my', authenticate, getMyReservations);
router.get('/my/:id', authenticate, getReservationById);
router.post('/my/:id/cancel', authenticate, cancelReservation);

// Admin/Staff routes
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), getAllReservations);
router.get('/:id', authenticate, authorize('ADMIN', 'STAFF'), getReservationById);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'STAFF'), updateReservationStatus);

export default router;
