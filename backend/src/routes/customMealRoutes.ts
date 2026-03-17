import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  submitCustomMealOrder,
  getMyCustomMealOrders,
  getCustomMealOrderById,
  updateCustomMealStatus,
  getAllCustomMealOrders,
  acceptQuote,
} from '../controllers/customMealController';

const router = Router();

router.use(authenticate);

// Customer routes
router.post('/', submitCustomMealOrder);
router.get('/my', getMyCustomMealOrders);
router.get('/my/:id', getCustomMealOrderById);
router.post('/my/:id/accept-quote', acceptQuote);

// Admin/Staff routes
router.get('/', authorize('ADMIN', 'STAFF'), getAllCustomMealOrders);
router.get('/:id', authorize('ADMIN', 'STAFF'), getCustomMealOrderById);
router.patch('/:id/status', authorize('ADMIN', 'STAFF'), updateCustomMealStatus);

export default router;
