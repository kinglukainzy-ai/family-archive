const express = require('express');
const router = express.Router();
const { getPersons, createPerson, getPersonById, updatePerson, deletePerson, uploadProfilePhoto } = require('../controllers/persons.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { checkPersonOwnership } = require('../middleware/ownership.middleware');

const upload = require('../middleware/upload.middleware');

router.use(protect);

router.get('/', adminOnly, getPersons);
router.post('/', adminOnly, createPerson);
router.get('/:id', getPersonById);
router.patch('/:id', checkPersonOwnership, updatePerson);
router.patch('/:id/photo', adminOnly, upload.single('file'), uploadProfilePhoto);
router.delete('/:id', adminOnly, deletePerson);

module.exports = router;
