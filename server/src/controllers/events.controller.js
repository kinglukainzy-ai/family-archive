const prisma = require('../utils/prismaClient');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get person life events
// @route   GET /api/events/persons/:personId
// @access  Member
const getEvents = asyncHandler(async (req, res) => {
  const events = await prisma.lifeEvent.findMany({
    where: { personId: req.params.personId },
    orderBy: { eventDate: 'asc' }
  });
  res.json(events);
});

// @desc    Add a life event
// @route   POST /api/events/persons/:personId
// @access  Member (own/children) + Admin
const createEvent = asyncHandler(async (req, res) => {
  const event = await prisma.lifeEvent.create({
    data: {
      ...req.body,
      personId: req.params.personId,
      eventDate: req.body.eventDate ? new Date(req.body.eventDate) : null
    }
  });
  res.status(201).json(event);
});

// @desc    Update a life event
// @route   PATCH /api/events/:id
// @access  Member (own/children) + Admin
const updateEvent = asyncHandler(async (req, res) => {
  const event = await prisma.lifeEvent.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      eventDate: req.body.eventDate ? new Date(req.body.eventDate) : null
    }
  });
  res.json(event);
});

module.exports = {
  getEvents,
  createEvent,
  updateEvent
};
