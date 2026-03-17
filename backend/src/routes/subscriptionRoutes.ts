import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  createSubscription,
  getMySubscriptions,
  getSubscriptionById,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  getAllSubscriptions,
  updateSubscriptionDelivery,
} from '../controllers/subscriptionController';

const router = Router();

// Public: view plans
router.get('/plans', getSubscriptionPlans);
router.get('/plans/:id', getSubscriptionPlanById);

// Admin: manage plans
router.post('/plans', authenticate, authorize('ADMIN'), createSubscriptionPlan);
router.patch('/plans/:id', authenticate, authorize('ADMIN'), updateSubscriptionPlan);

// Customer subscriptions
router.use(authenticate);
router.post('/', createSubscription);
router.get('/my', getMySubscriptions);
router.get('/my/:id', getSubscriptionById);
router.post('/my/:id/pause', pauseSubscription);
router.post('/my/:id/resume', resumeSubscription);
router.post('/my/:id/cancel', cancelSubscription);
router.patch('/my/:id/delivery', updateSubscriptionDelivery);

// Admin: all subscriptions
router.get('/', authorize('ADMIN', 'STAFF'), getAllSubscriptions);
router.get('/:id', authorize('ADMIN', 'STAFF'), getSubscriptionById);

export default router;
