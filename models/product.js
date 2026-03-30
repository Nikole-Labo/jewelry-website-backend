// src/models/product.js
import { poolPromise, sql } from '../services/dbConnection.js';

class ProductModel {
    async getAll() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
      SELECT p.*, c.name AS category_name
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.id
    `);
        return result.recordset;
    }

    async getById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
      SELECT p.*, c.name AS category_name
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.id
      WHERE p.id = @id
    `);
        return result.recordset[0];
    }

    async create(product) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('name', sql.NVarChar, product.name)
            .input('description', sql.NVarChar, product.description)
            .input('style', sql.NVarChar, product.style)
            .input('price', sql.Decimal(10, 2), product.price)
            .input('category_id', sql.Int, product.category_id)
            .input('user_added', sql.Bit, product.user_added)
            .input('video', sql.NVarChar, product.video || null)
            .input('photo', sql.NVarChar, product.photo || null)
            .query(`
        INSERT INTO Products (name, description, style, price, category_id, user_added, video, photo)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @style, @price, @category_id, @user_added, @video, @photo)
      `);

        return result.recordset[0]; 
    }

    async update(id, { name, description, style, price, category_id }) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description)
            .input('style', sql.NVarChar, style)
            .input('price', sql.Decimal(10, 2), price)
            .input('category_id', sql.Int, category_id)
            .query(`
                UPDATE Products 
                SET name = @name, description = @description, style = @style,
                    price = @price, category_id = @category_id
                WHERE id = @id
            `);
    }

    async delete(id) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Products WHERE id = @id');
    }

    async updateVideo(id, videoFilename) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('video', sql.NVarChar, videoFilename)
            .query(`
            UPDATE Products 
            SET video = @video
            WHERE id = @id
        `);
    }

    async updatePhoto(id, photoFilename) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('photo', sql.NVarChar, photoFilename)
            .query(`
            UPDATE Products
            SET photo = @photo
            WHERE id = @id
        `);
    }

}

const productModel = new ProductModel();
export default productModel;
