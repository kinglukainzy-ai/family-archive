const asyncHandler = require('../utils/asyncHandler');
const { generateFamilyPDF } = require('../services/pdf.service');

// @desc    Export family data to PDF
// @route   GET /api/export/pdf
// @access  Admin
const exportPDF = asyncHandler(async (req, res) => {
  const pdf = await generateFamilyPDF();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=family-report-${Date.now()}.pdf`,
    'Content-Length': pdf.length
  });

  res.send(pdf);
});

module.exports = { exportPDF };
