const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

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

  res.json({ message: 'Password reset successful' });
});

module.exports = {
  getDashboardStats,
  getAccounts,
  createAccount,
  resetPassword
};
