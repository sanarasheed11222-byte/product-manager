const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/upload');

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getStats
} = require('../controllers/productController');

router.get('/search', searchProducts);
router.get('/stats',  getStats);
router.get('/',       getAllProducts);
router.get('/:id',    getProductById);
router.post('/',      upload.single('image'), createProduct);
router.put('/:id',    upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;