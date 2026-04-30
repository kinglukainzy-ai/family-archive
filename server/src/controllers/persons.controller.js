const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');
const { notifyAdmin } = require('../services/notification.service');

// @desc    Get all persons
// @route   GET /api/persons
// @access  Admin
const getPersons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  const persons = await prisma.person.findMany({
    skip: Number(skip),
    take: Number(limit),
    orderBy: { lastName: 'asc' }
  });

  const total = await prisma.person.count();

  res.json({
    persons,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Create new person
// @route   POST /api/persons
// @access  Admin
const createPerson = asyncHandler(async (req, res) => {
  const {
    firstName, lastName, maidenName, otherNames, gender,
    dateOfBirth, dateOfDeath, birthPlace, deathPlace,
    isDeceased, isLiving, biography, occupation, nationality
  } = req.body;

  if (req.body.isRoot) {
    await prisma.person.updateMany({
      where: { isRoot: true },
      data: { isRoot: false }
    });
  }

  const person = await prisma.person.create({
    data: {
      firstName, lastName, maidenName, otherNames, gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      dateOfDeath: dateOfDeath ? new Date(dateOfDeath) : null,
      birthPlace, deathPlace, isDeceased, isLiving,
      biography, occupation, nationality,
      isRoot: !!req.body.isRoot
    }
  });

  await notifyAdmin(
    'NEW_MEMBER_ENROLLED',
    `${person.firstName} ${person.lastName} has been added to the archive.`,
    person.id
  );

  res.status(201).json(person);
});

// @desc    Get person profile
// @route   GET /api/persons/:id
// @access  Member
const getPersonById = asyncHandler(async (req, res) => {
  const person = await prisma.person.findUnique({
    where: { id: req.params.id },
    include: {
      lifeEvents: true,
      media: { where: { isApproved: true } },
      documents: { where: { isApproved: true } },
      unionsAsPartner1: { include: { partner2: true } },
      unionsAsPartner2: { include: { partner1: true } },
      childRecords: { include: { union: true } }
    }
  });

  if (!person) {
    return res.status(404).json({ message: 'Person not found' });
  }

  res.json(person);
});

// @desc    Update person
// @route   PATCH /api/persons/:id
// @access  Member (own/children) + Admin
const updatePerson = asyncHandler(async (req, res) => {
  const {
    firstName, lastName, maidenName, otherNames, gender,
    dateOfBirth, dateOfDeath, birthPlace, deathPlace,
    isDeceased, isLiving, biography, occupation, nationality
  } = req.body;

  const data = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (maidenName !== undefined) data.maidenName = maidenName;
  if (otherNames !== undefined) data.otherNames = otherNames;
  if (gender !== undefined) data.gender = gender;
  if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
  if (dateOfDeath !== undefined) data.dateOfDeath = dateOfDeath ? new Date(dateOfDeath) : null;
  if (birthPlace !== undefined) data.birthPlace = birthPlace;
  if (deathPlace !== undefined) data.deathPlace = deathPlace;
  if (isDeceased !== undefined) data.isDeceased = isDeceased;
  if (isLiving !== undefined) data.isLiving = isLiving;
  if (biography !== undefined) data.biography = biography;
  if (occupation !== undefined) data.occupation = occupation;
  if (nationality !== undefined) data.nationality = nationality;

  if (req.body.isRoot) {
    await prisma.person.updateMany({
      where: { isRoot: true },
      data: { isRoot: false }
    });
    data.isRoot = true;
  } else if (req.body.isRoot === false) {
    data.isRoot = false;
  }

  const person = await prisma.person.update({
    where: { id: req.params.id },
    data
  });

  await notifyAdmin(
    'PROFILE_UPDATED',
    `${person.firstName} ${person.lastName}'s profile was updated.`,
    person.id
  );

  res.json(person);
});

// @desc    Upload profile photo
// @route   PATCH /api/persons/:id/photo
// @access  Admin
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }

  const personId = req.params.id;
  const person = await prisma.person.update({
    where: { id: personId },
    data: { profilePhotoUrl: `/storage/photos/${personId}/${req.file.filename}` }
  });

  res.json(person);
});

// @desc    Delete person
// @route   DELETE /api/persons/:id
// @access  Admin
const deletePerson = asyncHandler(async (req, res) => {
  const personId = req.params.id;

  // Manual cascade deletion
  await prisma.$transaction([
    // Delete unions where this person is a partner
    prisma.union.deleteMany({
      where: {
        OR: [{ partner1Id: personId }, { partner2Id: personId }]
      }
    }),
    // Delete child records
    prisma.child.deleteMany({ where: { personId } }),
    // Delete media
    prisma.media.deleteMany({ where: { personId } }),
    // Delete documents
    prisma.document.deleteMany({ where: { personId } }),
    // Delete life events
    prisma.lifeEvent.deleteMany({ where: { personId } }),
    // Delete notifications
    prisma.notification.deleteMany({ where: { relatedPersonId: personId } }),
    // Delete account if exists
    prisma.account.deleteMany({ where: { personId } }),
    // Finally delete the person
    prisma.person.delete({ where: { id: personId } })
  ]);

  res.json({ message: 'Person and all associated records removed successfully.' });
});

module.exports = {
  getPersons,
  createPerson,
  getPersonById,
  updatePerson,
  deletePerson,
  uploadProfilePhoto
};
