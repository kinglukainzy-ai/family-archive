const puppeteer = require('puppeteer');
const prisma = require('../utils/prismaClient');

const generateFamilyPDF = async () => {
  const persons = await prisma.person.findMany({
    include: {
      lifeEvents: true,
      media: { where: { isApproved: true }, take: 3 }
    },
    orderBy: { lastName: 'asc' }
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; padding: 40px; color: #333; }
        .page-break { page-break-after: always; }
        .header { text-align: center; margin-bottom: 50px; }
        .profile { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .name { font-size: 24px; font-bold; color: #1e293b; }
        .dates { color: #64748b; font-size: 14px; margin-bottom: 10px; }
        .bio { line-height: 1.6; }
        .events-title { font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
        .event { margin-left: 20px; font-size: 14px; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Family Archive Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>Total Members: ${persons.length}</p>
      </div>
      
      <div class="page-break"></div>

      ${persons.map(person => `
        <div class="profile">
          <div class="name">${person.firstName} ${person.lastName}</div>
          <div class="dates">
            ${person.dateOfBirth ? new Date(person.dateOfBirth).getFullYear() : '???'} — 
            ${person.isDeceased ? (person.dateOfDeath ? new Date(person.dateOfDeath).getFullYear() : '???') : 'Present'}
          </div>
          <div class="bio">${person.biography || 'No biography available.'}</div>
          
          <div class="events-title">Life Events</div>
          ${person.lifeEvents.map(event => `
            <div class="event">
              <strong>${new Date(event.eventDate).toLocaleDateString()}:</strong> ${event.title} (${event.location || 'Unknown location'})
            </div>
          `).join('')}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();

  return pdf;
};

module.exports = { generateFamilyPDF };
