import { poolPromise, sql } from '../services/dbConnection.js';

class FavoriteModel {
  async listForUser(userId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT p.*, c.name AS category_name
        FROM Favorites f
        INNER JOIN Products p ON p.id = f.product_id
        LEFT JOIN Categories c ON p.category_id = c.id
        WHERE f.user_id = @userId
        ORDER BY f.product_id DESC
      `);
    return result.recordset;
  }

  async add(userId, productId) {
    const pool = await poolPromise;
    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('productId', sql.Int, productId)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM Favorites WHERE user_id = @userId AND product_id = @productId)
          INSERT INTO Favorites (user_id, product_id) VALUES (@userId, @productId)
      `);
  }

  async remove(userId, productId) {
    const pool = await poolPromise;
    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('productId', sql.Int, productId)
      .query(`DELETE FROM Favorites WHERE user_id = @userId AND product_id = @productId`);
  }

  async has(userId, productId) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('productId', sql.Int, productId)
      .query(`SELECT 1 AS ok FROM Favorites WHERE user_id = @userId AND product_id = @productId`);
    return result.recordset.length > 0;
  }
}

export default new FavoriteModel();
