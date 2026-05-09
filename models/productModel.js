const db = require('../config/db');

const Product = {

  getAll: async () => {
    const [rows] = await db.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE id = ?', [id]
    );
    return rows[0] || null;
  },

  create: async ({ name, category, price, stock, status, image }) => {
    const [result] = await db.query(
      'INSERT INTO products (name, category, price, stock, status, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, price, stock, status || 'active', image || null]
    );
    return result.insertId;
  },

  update: async (id, { name, category, price, stock, status, image }) => {
    const [result] = await db.query(
      'UPDATE products SET name=?, category=?, price=?, stock=?, status=?, image=? WHERE id=?',
      [name, category, price, stock, status, image || null, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query(
      'DELETE FROM products WHERE id = ?', [id]
    );
    return result.affectedRows;
  },

  search: async (keyword) => {
    const like = `%${keyword}%`;
    const [rows] = await db.query(
      'SELECT * FROM products WHERE name LIKE ? OR category LIKE ? ORDER BY created_at DESC',
      [like, like]
    );
    return rows;
  },

  getStats: async () => {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status='inactive' THEN 1 ELSE 0 END) AS inactive,
        SUM(stock) AS totalStock
      FROM products
    `);
    return rows[0];
  },

  getPaginated: async (page = 1, limit = 5) => {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [countRows] = await db.query('SELECT COUNT(*) AS total FROM products');
    return {
      products: rows,
      total: countRows[0].total,
      page,
      limit,
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  }

};

module.exports = Product;