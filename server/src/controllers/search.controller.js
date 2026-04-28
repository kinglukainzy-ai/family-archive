const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Search persons
// @route   GET /api/search
// @access  Member
const searchPersons = asyncHandler(async (req, res) => {
  const { q, birthDecade, birthPlace } = req.query;

  const where = {
    OR: [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { maidenName: { contains: q, mode: 'insensitive' } },
      { otherNames: { contains: q, mode: 'insensitive' } },
      { biography: { contains: q, mode: 'insensitive' } }
    ]
  };

  if (birthPlace) {
    where.birthPlace = { contains: birthPlace, mode: 'insensitive' };
  }

  // Handle birthDecade
  if (birthDecade) {
    const startYear = parseInt(birthDecade);
    const endYear = startYear + 9;
    where.dateOfBirth = {
      gte: new Date(`${startYear}-01-01`),
      lte: new Date(`${endYear}-12-31`)
    };
  }

  const results = await prisma.person.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      dateOfDeath: true,
      isDeceased: true,
      profilePhotoUrl: true,
      birthPlace: true
    },
    take: 20
  });

  res.json(results);
});

module.exports = { searchPersons };
