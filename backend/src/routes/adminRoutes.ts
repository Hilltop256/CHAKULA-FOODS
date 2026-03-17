import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
} from '../controllers/adminController';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/toggle-status', toggleUserStatus);

export default router;
