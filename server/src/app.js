const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for storage
app.use('/storage', express.static(path.join(__dirname, '../storage')));

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/persons', require('./routes/persons.routes'));
app.use('/api/tree', require('./routes/tree.routes'));
app.use('/api/unions', require('./routes/unions.routes'));
app.use('/api/media', require('./routes/media.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/events', require('./routes/events.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/export', require('./routes/export.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
