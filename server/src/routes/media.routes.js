const express = require('express');
const router = express.Router();
const { uploadMedia, getPendingMedia, approveMedia } = require('../controllers/media.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);

router.post('/persons/:personId/upload', upload.single('file'), uploadMedia);
router.get('/pending', adminOnly, getPendingMedia);
router.patch('/:id/approve', adminOnly, approveMedia);

module.exports = router;
