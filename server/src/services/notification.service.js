const prisma = require('../utils/prismaClient');
const cron = require('node-cron');

const createNotification = async (accountId, type, message, relatedPersonId = null) => {
  return await prisma.notification.create({
    data: {
      accountId,
      type,
      message,
      relatedPersonId
    }
  });
};

const notifyAdmin = async (type, message, relatedPersonId = null) => {
  const admins = await prisma.account.findMany({
    where: { role: 'ADMIN', isActive: true }
  });

  for (const admin of admins) {
    await createNotification(admin.id, type, message, relatedPersonId);
  }
};

// Birthday Cron Job
// Every day at 00:00
cron.schedule('0 0 * * *', async () => {
  const today = new Date();
  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();

  const persons = await prisma.person.findMany({
    where: {
      isDeceased: false,
      dateOfBirth: { not: null }
    }
  });

  const birthdayPersons = persons.filter(p => {
    const dob = new Date(p.dateOfBirth);
    return dob.getUTCMonth() + 1 === month && dob.getUTCDate() === day;
  });

  for (const person of birthdayPersons) {
    const allAccounts = await prisma.account.findMany({ where: { isActive: true } });
    for (const account of allAccounts) {
      await createNotification(
        account.id, 
        'BIRTHDAY_TODAY', 
        `🎂 Today is ${person.firstName} ${person.lastName}'s birthday!`,
        person.id
      );
    }
  }
});

// Daily at 00:05 — check for persons who turned 18 today and lock their profile
cron.schedule('5 0 * * *', async () => {
  const today = new Date();
  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();

  const persons = await prisma.person.findMany({
    where: {
      isDeceased: false,
      profileLocked: false,
      account: null, // no account yet
      dateOfBirth: { not: null }
    }
  });

  const turnedEighteen = persons.filter(p => {
    const dob = new Date(p.dateOfBirth);
    const age = today.getUTCFullYear() - dob.getUTCFullYear();
    return (
      age === 18 &&
      dob.getUTCMonth() + 1 === month &&
      dob.getUTCDate() === day
    );
  });

  for (const person of turnedEighteen) {
    // Lock the profile
    await prisma.person.update({
      where: { id: person.id },
      data: { profileLocked: true }
    });

    // Notify admin
    await notifyAdmin(
      'PROFILE_LOCKED',
      `${person.firstName} ${person.lastName} has turned 18. Their profile is now locked until you create their account.`,
      person.id
    );

    // Find and notify parents
    const parentUnions = await prisma.child.findMany({
      where: { personId: person.id },
      include: {
        union: {
          include: {
            partner1: { include: { account: true } },
            partner2: { include: { account: true } }
          }
        }
      }
    });

    for (const childRecord of parentUnions) {
      const parents = [
        childRecord.union.partner1,
        childRecord.union.partner2
      ].filter(p => p && p.account && p.account.isActive);

      for (const parent of parents) {
        await createNotification(
          parent.account.id,
          'PROFILE_LOCKED',
          `${person.firstName} ${person.lastName} has turned 18. Their profile has been locked and the admin has been notified to create their account.`,
          person.id
        );
      }
    }
  }
});

module.exports = {
  createNotification,
  notifyAdmin
};
