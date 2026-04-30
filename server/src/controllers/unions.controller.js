const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all unions
// @route   GET /api/unions
// @access  Admin
const getUnions = asyncHandler(async (req, res) => {
  const unions = await prisma.union.findMany({
    include: {
      partner1: true,
      partner2: true,
      children: { include: { person: true } }
    }
  });
  res.json(unions);
});

// @desc    Create a union
// @route   POST /api/unions
// @access  Admin
const createUnion = asyncHandler(async (req, res) => {
  const { partner1Id, partner2Id, unionType, startDate, endDate, stillTogether, notes } = req.body;
  
  const union = await prisma.union.create({
    data: {
      partner1Id,
      partner2Id: partner2Id || null,
      unionType,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      stillTogether,
      notes
    }
  });

  res.status(201).json(union);
});

// @desc    Add a child to a union
// @route   POST /api/unions/:id/children
// @access  Admin
const addChildToUnion = asyncHandler(async (req, res) => {
  const { personId, relationshipType, birthOrder } = req.body;
  const unionId = req.params.id;

  const child = await prisma.child.create({
    data: {
      unionId,
      personId,
      relationshipType,
      birthOrder
    }
  });

  res.status(201).json(child);
});

// @desc    Update union
// @route   PATCH /api/unions/:id
// @access  Admin
const updateUnion = asyncHandler(async (req, res) => {
  const union = await prisma.union.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(union);
});

// @desc    Remove union
// @route   DELETE /api/unions/:id
// @access  Admin
const deleteUnion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.$transaction([
    // First, remove all child-union links for this union
    prisma.child.deleteMany({
      where: { unionId: id }
    }),
    // Then delete the union itself
    prisma.union.delete({
      where: { id }
    })
  ]);

  res.json({ message: 'Union and associated links removed successfully' });
});

// @desc    Remove child from union
// @route   DELETE /api/unions/:unionId/children/:personId
// @access  Admin
const removeChildFromUnion = asyncHandler(async (req, res) => {
  const { unionId, personId } = req.params;
  await prisma.child.delete({
    where: {
      unionId_personId: {
        unionId,
        personId
      }
    }
  });
  res.json({ message: 'Child link removed' });
});

module.exports = {
  getUnions,
  createUnion,
  addChildToUnion,
  updateUnion,
  deleteUnion,
  removeChildFromUnion
};
