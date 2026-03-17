import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getTables,
  createTable,
  updateTable,
  updateTableStatus,
  getAvailableTables,
  createReservation,
  getMyReservations,
  getReservationById,
  updateReservationStatus,
  cancelReservation,
  getAllReservations,
} from '../controllers/tableController';

const router = Router();

// Tables - public read, admin write
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), getTables);
router.post('/', authenticate, authorize('ADMIN'), createTable);
router.patch('/:id', authenticate, authorize('ADMIN'), updateTable);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'STAFF'), updateTableStatus);

export default router;
