const express = require('express');
const router = express.Router();
const { exportPDF } = require('../controllers/export.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.get('/pdf', protect, adminOnly, exportPDF);

module.exports = router;
