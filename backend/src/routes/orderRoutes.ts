import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
} from '../controllers/orderController';

const router = Router();

router.use(authenticate);

// Customer routes
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/my/:id', getOrderById);
router.post('/my/:id/cancel', cancelOrder);

// Admin/Staff routes
router.get('/', authorize('ADMIN', 'STAFF'), getAllOrders);
router.get('/:id', authorize('ADMIN', 'STAFF'), getOrderById);
router.patch('/:id/status', authorize('ADMIN', 'STAFF'), updateOrderStatus);

export default router;
