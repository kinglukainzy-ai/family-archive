const express = require('express');
const router = express.Router();
const { getUnions, createUnion, addChildToUnion, updateUnion, deleteUnion, removeChildFromUnion } = require('../controllers/unions.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/', getUnions);
router.post('/', createUnion);
router.patch('/:id', updateUnion);
router.delete('/:id', deleteUnion);
router.post('/:id/children', addChildToUnion);
router.delete('/:unionId/children/:personId', removeChildFromUnion);

module.exports = router;
