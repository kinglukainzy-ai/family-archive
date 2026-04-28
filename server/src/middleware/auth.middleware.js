const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await prisma.account.findUnique({
      where: { id: decoded.id },
      include: { person: true }
    });

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: 'Not authorized, user not found or inactive' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
});

module.exports = { protect };
