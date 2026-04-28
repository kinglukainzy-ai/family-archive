const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');
const { processImage } = require('../services/media.service');
const path = require('path');

// @desc    Upload media
// @route   POST /api/media/persons/:personId/upload
// @access  Member (own/children) + Admin
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { personId } = req.params;
  const { caption, takenAt } = req.body;
  
  let mediaData = {
    personId,
    caption,
    takenAt: takenAt ? new Date(takenAt) : null,
    uploadedById: req.user.id,
    isApproved: req.user.role === 'ADMIN' // Auto-approve if admin
  };

  if (req.file.mimetype.startsWith('image/')) {
    const processed = await processImage(req.file.path);
    // Convert absolute paths to relative storage paths for the DB
    const relativeUrl = path.relative(path.join(__dirname, '../../'), processed.url);
    const relativeThumbUrl = path.relative(path.join(__dirname, '../../'), processed.thumbnailUrl);
    
    mediaData.type = 'PHOTO';
    mediaData.url = '/' + relativeUrl.replace(/\\/g, '/');
    mediaData.thumbnailUrl = '/' + relativeThumbUrl.replace(/\\/g, '/');
  } else if (req.file.mimetype.startsWith('video/')) {
    const relativeUrl = path.relative(path.join(__dirname, '../../'), req.file.path);
    mediaData.type = 'VIDEO_UPLOAD';
    mediaData.url = '/' + relativeUrl.replace(/\\/g, '/');
  } else {
    // Documents handled separately or here?
    // Let's handle documents in a separate controller or here
    const relativeUrl = path.relative(path.join(__dirname, '../../'), req.file.path);
    
    const doc = await prisma.document.create({
      data: {
        personId,
        title: req.file.originalname,
        fileUrl: '/' + relativeUrl.replace(/\\/g, '/'),
        fileType: path.extname(req.file.originalname).substring(1),
        fileSizeKb: Math.round(req.file.size / 1024),
        uploadedById: req.user.id,
        isApproved: req.user.role === 'ADMIN'
      }
    });
    return res.status(201).json(doc);
  }

  const media = await prisma.media.create({
    data: mediaData
  });

  res.status(201).json(media);
});

// @desc    Get pending media
// @route   GET /api/media/pending
// @access  Admin
const getPendingMedia = asyncHandler(async (req, res) => {
  const media = await prisma.media.findMany({
    where: { isApproved: false },
    include: { person: true }
  });
  const documents = await prisma.document.findMany({
    where: { isApproved: false },
    include: { person: true }
  });
  res.json({ media, documents });
});

// @desc    Approve media
// @route   PATCH /api/media/:id/approve
// @access  Admin
const approveMedia = asyncHandler(async (req, res) => {
  const media = await prisma.media.update({
    where: { id: req.params.id },
    data: { isApproved: true }
  });
  res.json(media);
});

module.exports = {
  uploadMedia,
  getPendingMedia,
  approveMedia
};
