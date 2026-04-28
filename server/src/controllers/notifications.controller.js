const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get own notifications
// @route   GET /api/notifications
// @access  Member
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { accountId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { relatedPerson: true }
  });
  res.json(notifications);
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Member
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true }
  });
  res.json(notification);
});

// @desc    Mark all as read
// @route   PATCH /api/notifications/read-all
// @access  Member
const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { accountId: req.user.id, isRead: false },
    data: { isRead: true }
  });
  res.json({ message: 'All notifications marked as read' });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead
};
