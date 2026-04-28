const express = require('express');
const router = express.Router();
const { uploadMedia, getPendingMedia, approveMedia, rejectMedia, linkExternalVideo } = require('../controllers/media.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { checkPersonOwnership } = require('../middleware/ownership.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);

router.post('/persons/:personId/upload', upload.single('file'), uploadMedia); 
router.post('/persons/:personId/link-video', checkPersonOwnership, linkExternalVideo);

router.get('/pending', adminOnly, getPendingMedia);
router.patch('/:id/approve', adminOnly, approveMedia);
router.patch('/:id/reject', adminOnly, rejectMedia);

module.exports = router;
