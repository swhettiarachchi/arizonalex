const router = require('express').Router();
const { getEvents, createEvent, updateEvent, deleteEvent, attendEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.get('/', getEvents);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.put('/:id/attend', protect, attendEvent);

module.exports = router;
