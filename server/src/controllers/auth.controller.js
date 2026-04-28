const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const account = await prisma.account.findUnique({
    where: { username }
  });

  if (account && (await bcrypt.compare(password, account.passwordHash))) {
    const token = generateToken(account.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      id: account.id,
      username: account.username,
      role: account.role,
      forcePasswordChange: account.forcePasswordChange
    });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const account = await prisma.account.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      role: true,
      forcePasswordChange: true,
      person: true
    }
  });

  res.json(account);
});

// @desc    Change own password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const account = await prisma.account.findUnique({
    where: { id: req.user.id }
  });

  if (account && (await bcrypt.compare(currentPassword, account.passwordHash))) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.account.update({
      where: { id: req.user.id },
      data: {
        passwordHash,
        forcePasswordChange: false
      }
    });

    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401).json({ message: 'Invalid current password' });
  }
});

module.exports = {
  login,
  logout,
  getMe,
  changePassword
};
