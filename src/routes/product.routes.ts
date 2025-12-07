import express from 'express';
import ProductController from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = express.Router();

router
  .route('/')
  .get(ProductController.getAllProducts)
  .post(protect, restrictTo('admin'), upload.array('images', 5), ProductController.createProduct);

router
  .route('/:id')
  .get(ProductController.getProduct)
  .put(protect, restrictTo('admin'), upload.array('images', 5), ProductController.updateProduct)
  .delete(protect, restrictTo('admin'), ProductController.deleteProduct);

router.post('/:id/reviews', protect, ProductController.createProductReview);

export default router;
