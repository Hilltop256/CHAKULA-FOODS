import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCart);
router.patch('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

export default router;
