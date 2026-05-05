require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const productRoutes = require('./routes/productRoutes');
const authRoutes    = require('./routes/authRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ✅ Configure CORS explicitly
const corsOptions = {
  origin: 'http://localhost:5000', // your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Handle preflight OPTIONS requests globally BEFORE the catch-all route
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);

// ✅ This catch-all must come LAST so it doesn't swallow OPTIONS requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅  Server running → http://localhost:${PORT}`);
  console.log(`🔐  Auth API       → http://localhost:${PORT}/api/auth`);
  console.log(`📦  Products API   → http://localhost:${PORT}/api/products\n`);
});