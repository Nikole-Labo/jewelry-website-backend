import express from 'express';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controller/productController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate.js';
import { ROLE_ADMIN } from '../constants/roles.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', authenticateToken, authorizeRoles(ROLE_ADMIN), createProduct);
router.put('/:id', authenticateToken, authorizeRoles(ROLE_ADMIN), updateProduct);
router.patch('/:id', authenticateToken, authorizeRoles(ROLE_ADMIN), updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles(ROLE_ADMIN), deleteProduct);

export default router;
