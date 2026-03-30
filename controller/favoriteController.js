import favoriteModel from '../models/favorite.js';
import { formatFavoriteError } from '../utils/favoriteErrors.js';

function userIdFromReq(req) {
  const id = req.user?.id;
  const n = typeof id === 'number' ? id : parseInt(id, 10);
  return Number.isFinite(n) ? n : null;
}

export async function listFavorites(req, res) {
  const userId = userIdFromReq(req);
  if (userId == null) {
    return res.status(401).json({ error: 'Invalid session' });
  }
  try {
    const products = await favoriteModel.listForUser(userId);
    res.json(products);
  } catch (err) {
    console.error('listFavorites:', err);
    const { error, hint, detail } = formatFavoriteError(err);
    res.status(500).json({ error, hint, detail });
  }
}

export async function addFavorite(req, res) {
  const userId = userIdFromReq(req);
  if (userId == null) {
    return res.status(401).json({ error: 'Invalid session' });
  }
  const productId = parseInt(req.params.productId, 10);
  if (!Number.isFinite(productId)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }
  try {
    await favoriteModel.add(userId, productId);
    res.status(201).json({ productId });
  } catch (err) {
    console.error('addFavorite:', err);
    const { error, hint, detail } = formatFavoriteError(err);
    res.status(500).json({ error, hint, detail });
  }
}

export async function removeFavorite(req, res) {
  const userId = userIdFromReq(req);
  if (userId == null) {
    return res.status(401).json({ error: 'Invalid session' });
  }
  const productId = parseInt(req.params.productId, 10);
  if (!Number.isFinite(productId)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }
  try {
    await favoriteModel.remove(userId, productId);
    res.status(204).end();
  } catch (err) {
    console.error('removeFavorite:', err);
    const { error, hint, detail } = formatFavoriteError(err);
    res.status(500).json({ error, hint, detail });
  }
}
