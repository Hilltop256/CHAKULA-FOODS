import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  addReview,
  getProductReviews,
} from '../controllers/productController';

const router = Router();

// Categories
router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.post('/categories', authenticate, authorize('ADMIN'), createCategory);
router.patch('/categories/:id', authenticate, authorize('ADMIN'), updateCategory);
router.delete('/categories/:id', authenticate, authorize('ADMIN'), deleteCategory);

// Products
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), createProduct);
router.patch('/:id', authenticate, authorize('ADMIN', 'STAFF'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

// Reviews
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', authenticate, addReview);

export default router;
