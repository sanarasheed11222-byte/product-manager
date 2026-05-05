const express  = require('express');
const router   = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const protect  = require('../middleware/authMiddleware');

router.post('/signup', signup);       // POST /api/auth/signup
router.post('/login',  login);        // POST /api/auth/login
router.get('/me',      protect, getMe); // GET  /api/auth/me  (protected)

module.exports = router;