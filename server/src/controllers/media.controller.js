const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');
const { processImage } = require('../services/media.service');
const fs = require('fs');
const path = require('path');
const { createNotification, notifyAdmin } = require('../services/notification.service');

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

  if (req.user.role !== 'ADMIN') {
    await notifyAdmin(
      'MEDIA_PENDING',
      `New media uploaded for ${personId} awaiting your approval.`,
      personId
    );
  }

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

  if (media.uploadedById) {
    await createNotification(
      media.uploadedById,
      'MEDIA_APPROVED',
      'Your uploaded media has been approved and is now visible.',
      media.personId
    );
  }

  res.json(media);
});

const rejectMedia = asyncHandler(async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } });

  if (!media) return res.status(404).json({ message: 'Media not found' });

  // Delete file from disk for uploaded types (not external links)
  if (media.type !== 'VIDEO_LINK') {
    const filePath = path.join(__dirname, '../../', media.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    if (media.thumbnailUrl) {
      const thumbPath = path.join(__dirname, '../../', media.thumbnailUrl);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }
  }

  await prisma.media.delete({ where: { id: req.params.id } });

  // Notify uploader if known
  if (media.uploadedById) {
    await createNotification(
      media.uploadedById,
      'MEDIA_REJECTED',
      'Your uploaded media was reviewed and not approved.',
      media.personId
    );
  }

  res.json({ message: 'Media rejected and deleted' });
});

const ALLOWED_VIDEO_DOMAINS = ['youtube.com', 'youtu.be', 'vimeo.com', 'www.youtube.com', 'www.vimeo.com'];

const linkExternalVideo = asyncHandler(async (req, res) => {
  const { personId } = req.params;
  const { url, caption, takenAt } = req.body;

  if (!url) return res.status(400).json({ message: 'URL is required' });

  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return res.status(400).json({ message: 'Invalid URL format' });
  }

  if (!ALLOWED_VIDEO_DOMAINS.includes(hostname)) {
    return res.status(400).json({ message: 'Only YouTube and Vimeo links are allowed' });
  }

  const media = await prisma.media.create({
    data: {
      personId,
      type: 'VIDEO_LINK',
      url,
      caption,
      takenAt: takenAt ? new Date(takenAt) : null,
      uploadedById: req.user.id,
      isApproved: req.user.role === 'ADMIN'
    }
  });

  if (req.user.role !== 'ADMIN') {
    await notifyAdmin('MEDIA_PENDING', `New video link added for review.`, personId);
  }

  res.status(201).json(media);
});

module.exports = {
  uploadMedia,
  getPendingMedia,
  approveMedia,
  rejectMedia,
  linkExternalVideo
};
