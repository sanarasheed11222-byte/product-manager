const db = require('../config/db');

const User = {

  getByEmail: async (email) => {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    return rows[0] || null;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?', [id]
    );
    return rows[0] || null;
  },

  create: async ({ name, email, password }) => {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return result.insertId;
  }

};

module.exports = User;