const express = require('express');
const router = express.Router();
const { getPersons, createPerson, getPersonById, updatePerson, deletePerson } = require('../controllers/persons.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { checkPersonOwnership } = require('../middleware/ownership.middleware');

router.use(protect);

router.get('/', adminOnly, getPersons);
router.post('/', adminOnly, createPerson);
router.get('/:id', getPersonById);
router.patch('/:id', checkPersonOwnership, updatePerson);
router.delete('/:id', adminOnly, deletePerson);

module.exports = router;
