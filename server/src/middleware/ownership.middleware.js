const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');

const checkPersonOwnership = asyncHandler(async (req, res, next) => {
  // Admin bypasses all ownership checks
  if (req.user.role === 'ADMIN') return next();

  const targetPersonId = req.params.id || req.params.personId;
  const currentUserPersonId = req.user.personId;

  if (!currentUserPersonId) {
    return res.status(403).json({ message: 'No person profile linked to your account' });
  }

  // Allow editing own profile
  if (targetPersonId === currentUserPersonId) return next();

  // Allow editing own under-18 children
  // Find all unions where current user's person is a partner
  const unions = await prisma.union.findMany({
    where: {
      OR: [
        { partner1Id: currentUserPersonId },
        { partner2Id: currentUserPersonId }
      ]
    },
    include: {
      children: { include: { person: true } }
    }
  });

  const today = new Date();
  const ownChildren = unions.flatMap(u => u.children.map(c => c.person));

  const isEligibleChild = ownChildren.some(child => {
    if (child.id !== targetPersonId) return false;
    if (!child.dateOfBirth) return false; // no DOB = cannot verify age = deny
    const age = today.getFullYear() - new Date(child.dateOfBirth).getFullYear();
    const hadBirthdayThisYear =
      today.getMonth() > new Date(child.dateOfBirth).getMonth() ||
      (today.getMonth() === new Date(child.dateOfBirth).getMonth() &&
       today.getDate() >= new Date(child.dateOfBirth).getDate());
    const actualAge = hadBirthdayThisYear ? age : age - 1;
    return actualAge < 18;
  });

  if (isEligibleChild) return next();

  return res.status(403).json({ message: 'You do not have permission to edit this profile' });
});

module.exports = { checkPersonOwnership };
