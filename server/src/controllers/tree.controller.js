const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');
const { buildTree } = require('../services/tree.service');

// @desc    Get full tree data
// @route   GET /api/tree
// @access  Member
const getTree = asyncHandler(async (req, res) => {
  const rootPerson = await prisma.person.findFirst({
    where: { isRoot: true }
  });

  if (!rootPerson) {
    return res.json({ root: null, message: 'Root person not set. Please designate a root person in the admin panel.' });
  }

  const tree = await buildTree(rootPerson.id);
  res.json({ root: tree });
});

// @desc    Get the current root person
// @route   GET /api/tree/root
// @access  Member
const getRoot = asyncHandler(async (req, res) => {
  const rootPerson = await prisma.person.findFirst({
    where: { isRoot: true }
  });

  if (!rootPerson) {
    return res.json(null);
  }

  res.json(rootPerson);
});

// @desc    Set a different root person
// @route   PATCH /api/tree/root
// @access  Admin
const setRoot = asyncHandler(async (req, res) => {
  const { personId } = req.body;

  // Transaction to unset previous root and set new root
  await prisma.$transaction([
    prisma.person.updateMany({
      where: { isRoot: true },
      data: { isRoot: false }
    }),
    prisma.person.update({
      where: { id: personId },
      data: { isRoot: true }
    })
  ]);

  res.json({ message: 'Root person updated' });
});

module.exports = {
  getTree,
  getRoot,
  setRoot
};
