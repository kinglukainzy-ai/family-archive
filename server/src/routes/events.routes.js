const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent } = require('../controllers/events.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/persons/:personId', getEvents);
router.post('/persons/:personId', createEvent);
router.patch('/:id', updateEvent);

module.exports = router;
