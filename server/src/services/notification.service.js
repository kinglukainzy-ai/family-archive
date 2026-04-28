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

module.exports = {
  createNotification,
  notifyAdmin
};
