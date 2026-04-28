const prisma = require('../utils/prismaClient');

const buildTree = async (personId, visited = new Set()) => {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      unionsAsPartner1: {
        include: {
          partner2: true,
          children: {
            include: {
              person: true
            }
          }
        }
      },
      unionsAsPartner2: {
        include: {
          partner1: true,
          children: {
            include: {
              person: true
            }
          }
        }
      }
    }
  });

  if (!person) return null;

  if (visited.has(person.id)) {
    return {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      isAlreadyRendered: true
    };
  }

  visited.add(person.id);

  const allUnions = [
    ...person.unionsAsPartner1.map(u => ({ ...u, partner: u.partner2 })),
    ...person.unionsAsPartner2.map(u => ({ ...u, partner: u.partner1 }))
  ];

  const nestedUnions = await Promise.all(allUnions.map(async (union) => {
    const children = await Promise.all(union.children.map(async (childRecord) => {
      return await buildTree(childRecord.person.id, new Set(visited));
    }));

    return {
      id: union.id,
      unionType: union.unionType,
      partner: union.partner ? {
        id: union.partner.id,
        firstName: union.partner.firstName,
        lastName: union.partner.lastName,
        isDeceased: union.partner.isDeceased,
        profilePhotoUrl: union.partner.profilePhotoUrl
      } : null,
      children: children.filter(c => c !== null)
    };
  }));

  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    dateOfBirth: person.dateOfBirth,
    dateOfDeath: person.dateOfDeath,
    isDeceased: person.isDeceased,
    profilePhotoUrl: person.profilePhotoUrl,
    unions: nestedUnions,
    isAlreadyRendered: false
  };
};

module.exports = { buildTree };
