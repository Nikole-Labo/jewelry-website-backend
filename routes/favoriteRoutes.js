import express from 'express';
import { authenticateToken, rejectAdminUsers } from '../middleware/authenticate.js';
import { listFavorites, addFavorite, removeFavorite } from '../controller/favoriteController.js';

const router = express.Router();

router.use(authenticateToken, rejectAdminUsers);

router.get('/', listFavorites);
router.post('/:productId', addFavorite);
router.delete('/:productId', removeFavorite);

export default router;
