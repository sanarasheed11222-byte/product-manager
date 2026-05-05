CREATE DATABASE IF NOT EXISTS product_db;
USE product_db;

DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)               NOT NULL,
  category   VARCHAR(50)                NOT NULL,
  price      DECIMAL(10, 2)             NOT NULL,
  stock      INT                        NOT NULL DEFAULT 0,
  status     ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP                  DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP                  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO products (name, category, price, stock, status) VALUES
('Wireless Headphones',  'Electronics', 59.99,  120, 'active'),
('Running Shoes',        'Footwear',    89.99,   45, 'active'),
('Coffee Maker',         'Kitchen',     34.99,   30, 'inactive'),
('Yoga Mat',             'Sports',      24.99,  200, 'active'),
('Mechanical Keyboard',  'Electronics', 129.00,   8, 'active'),
('Leather Wallet',       'Accessories', 19.99,   60, 'active'),
('Water Bottle',         'Sports',      14.99,  150, 'inactive'),
('Desk Lamp',            'Home',        39.99,   25, 'active');