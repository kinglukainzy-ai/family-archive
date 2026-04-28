const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const { createNotification } = require('../services/notification.service');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const personsCount = await prisma.person.count();
  const accountsCount = await prisma.account.count();
  const pendingMediaCount = await prisma.media.count({ where: { isApproved: false } });
  const pendingDocsCount = await prisma.document.count({ where: { isApproved: false } });
  const lockedProfilesCount = await prisma.person.count({ where: { profileLocked: true } });

  res.json({
    personsCount,
    accountsCount,
    pendingMediaCount: pendingMediaCount + pendingDocsCount,
    lockedProfilesCount
  });
});

// @desc    Get all accounts
// @route   GET /api/admin/accounts
// @access  Admin
const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await prisma.account.findMany({
    include: { person: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(accounts);
});

// @desc    Create account
// @route   POST /api/admin/accounts
// @access  Admin
const createAccount = asyncHandler(async (req, res) => {
  const { username, password, personId, role } = req.body;

  const passwordHash = await bcrypt.hash(password, 12);

  const account = await prisma.account.create({
    data: {
      username,
      passwordHash,
      personId,
      role: role || 'MEMBER',
      forcePasswordChange: true
    }
  });

  await createNotification(
    account.id,
    'NEW_ACCOUNT_CREATED',
    'Welcome to the family archive. Your account is ready. Please change your password on first login.',
    personId || null
  );

  // Notify all other active members that a new person was enrolled
  if (personId) {
    const person = await prisma.person.findUnique({ where: { id: personId } });
    if (person) {
      const allAccounts = await prisma.account.findMany({
        where: { isActive: true, id: { not: account.id } }
      });
      for (const acc of allAccounts) {
        await createNotification(
          acc.id,
          'NEW_MEMBER_ENROLLED',
          `${person.firstName} ${person.lastName} has joined the family archive.`,
          personId
        );
      }
    }
  }

  res.status(201).json(account);
});

// @desc    Reset account password
// @route   PATCH /api/admin/accounts/:id/reset-password
// @access  Admin
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.account.update({
    where: { id: req.params.id },
    data: {
      passwordHash,
      forcePasswordChange: true
    }
  });

  await createNotification(
    req.params.id,
    'ACCOUNT_RESET',
    'Your password has been reset by the admin. Please log in with your new password.',
    null
  );

  res.json({ message: 'Password reset successful' });
});

// @desc    Deactivate an account
// @route   PATCH /api/admin/accounts/:id/deactivate
// @access  Admin
const deactivateAccount = asyncHandler(async (req, res) => {
  const account = await prisma.account.update({
    where: { id: req.params.id },
    data: { isActive: false }
  });
  res.json({ message: 'Account deactivated', account });
});

// @desc    Get persons not yet linked in the tree
// @route   GET /api/admin/unplaced
// @access  Admin
const getUnplacedPersons = asyncHandler(async (req, res) => {
  // A person is "unplaced" if they appear in no Child record AND are not the root
  const placedPersonIds = await prisma.child.findMany({
    select: { personId: true }
  });
  const placedIds = placedPersonIds.map(c => c.personId);

  const unplaced = await prisma.person.findMany({
    where: {
      id: { notIn: placedIds },
      isRoot: false
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      isDeceased: true,
      profilePhotoUrl: true
    }
  });

  res.json(unplaced);
});

module.exports = {
  getDashboardStats,
  getAccounts,
  createAccount,
  resetPassword,
  deactivateAccount,
  getUnplacedPersons
};
