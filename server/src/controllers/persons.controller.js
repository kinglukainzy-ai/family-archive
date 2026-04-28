const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');

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
  const person = await prisma.person.create({
    data: req.body
  });

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
  const person = await prisma.person.update({
    where: { id: req.params.id },
    data: req.body
  });

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
