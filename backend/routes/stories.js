const router = require('express').Router();
const { getStories, createStory, viewStory, deleteStory } = require('../controllers/storyController');
const { protect } = require('../middleware/auth');

router.get('/', getStories);
router.post('/', protect, createStory);
router.put('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
