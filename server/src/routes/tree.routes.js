const express = require('express');
const router = express.Router();
const { getTree, getRoot, setRoot } = require('../controllers/tree.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.use(protect);

router.get('/', getTree);
router.get('/root', getRoot);
router.patch('/root', adminOnly, setRoot);

module.exports = router;
