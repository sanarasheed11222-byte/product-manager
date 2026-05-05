const validateProduct = (req, res, next) => {
  const { name, category, price, stock } = req.body;
  const errors = [];

  if (!name || name.trim() === '') errors.push('Product name is required.');
  if (!category || category.trim() === '') errors.push('Category is required.');
  if (price === undefined || price === null || price === '') {
    errors.push('Price is required.');
  } else if (isNaN(price) || Number(price) < 0) {
    errors.push('Price must be a valid positive number.');
  }
  if (stock === undefined || stock === null || stock === '') {
    errors.push('Stock is required.');
  } else if (isNaN(stock) || Number(stock) < 0) {
    errors.push('Stock must be a valid positive integer.');
  }

  if (errors.length > 0)
    return res.status(400).json({ success: false, message: errors.join(' ') });

  next();
};

module.exports = validateProduct;