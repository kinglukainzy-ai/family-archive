const express = require('express');
const router = express.Router();
const { getDashboardStats, getAccounts, createAccount, resetPassword, deactivateAccount, getUnplacedPersons } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/dashboard-stats', getDashboardStats);
router.get('/accounts', getAccounts);
router.post('/accounts', createAccount);
router.patch('/accounts/:id/reset-password', resetPassword);
router.patch('/accounts/:id/deactivate', deactivateAccount);
router.get('/unplaced', getUnplacedPersons);

module.exports = router;
