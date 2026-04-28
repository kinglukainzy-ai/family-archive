const express = require('express');
const router = express.Router();
const { searchPersons } = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', searchPersons);

module.exports = router;
