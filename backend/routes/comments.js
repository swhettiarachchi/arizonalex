const router = require('express').Router();
const { getComments, createComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/post/:postId', getComments);
router.post('/post/:postId', protect, createComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
