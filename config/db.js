const mysql = require('mysql2');

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:             process.env.DB_PORT     || 3307,
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'product_db',
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0
});

const db = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌  Database connection failed:', err.message);
  } else {
    console.log('✅  MySQL connected successfully (XAMPP)');
    connection.release();
  }
});

module.exports = db;