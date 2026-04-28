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

  const person = await prisma.person.create({
    data: {
      firstName, lastName, maidenName, otherNames, gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      dateOfDeath: dateOfDeath ? new Date(dateOfDeath) : null,
      birthPlace, deathPlace, isDeceased, isLiving,
      biography, occupation, nationality
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

// @desc    Delete person
// @route   DELETE /api/persons/:id
// @access  Admin
const deletePerson = asyncHandler(async (req, res) => {
  await prisma.person.delete({
    where: { id: req.params.id }
  });

  res.json({ message: 'Person removed' });
});

module.exports = {
  getPersons,
  createPerson,
  getPersonById,
  updatePerson,
  deletePerson
};
