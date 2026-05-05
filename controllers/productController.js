const Product = require('../models/productModel');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, status } = req.body;
    if (!name || !category || price == null || stock == null)
      return res.status(400).json({ success: false, message: 'Fields required: name, category, price, stock.' });
    if (isNaN(price) || price < 0)
      return res.status(400).json({ success: false, message: 'Price must be a positive number.' });
    if (isNaN(stock) || stock < 0)
      return res.status(400).json({ success: false, message: 'Stock must be a positive integer.' });

    const insertId = await Product.create({ name, category, price, stock, status });
    const newProduct = await Product.getById(insertId);
    res.status(201).json({ success: true, message: 'Product created successfully!', data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, category, price, stock, status } = req.body;
    const existing = await Product.getById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (!name || !category || price == null || stock == null)
      return res.status(400).json({ success: false, message: 'Fields required: name, category, price, stock.' });

    await Product.update(req.params.id, { name, category, price, stock, status });
    const updated = await Product.getById(req.params.id);
    res.status(200).json({ success: true, message: 'Product updated successfully!', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const existing = await Product.getById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });
    await Product.delete(req.params.id);
    res.status(200).json({ success: true, message: `Product "${existing.name}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const products = await Product.search(keyword);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await Product.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getStats
};