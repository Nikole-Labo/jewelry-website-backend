import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate.js';
import { ROLE_ADMIN } from '../constants/roles.js';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getTopCategoriesByAvgPrice,
} from '../controller/categoryController.js';

const router = express.Router();

router.get('/stats/top-by-price', getTopCategoriesByAvgPrice);
router.get('/', getAllCategories);
router.get('/:id', getCategory);
router.post('/', authenticateToken, authorizeRoles(ROLE_ADMIN), createCategory);
router.patch('/:id', authenticateToken, authorizeRoles(ROLE_ADMIN), updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles(ROLE_ADMIN), deleteCategory);

export default router;
