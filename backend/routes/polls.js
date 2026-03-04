const router = require('express').Router();
const { getPolls, createPoll, votePoll } = require('../controllers/pollController');
const { protect } = require('../middleware/auth');

router.get('/', getPolls);
router.post('/', protect, createPoll);
router.put('/:id/vote', protect, votePoll);

module.exports = router;
