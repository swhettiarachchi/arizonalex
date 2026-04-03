const router = require('express').Router();
const {
    getPosts, getPost, createPost, updatePost, deletePost,
    likePost, repost, bookmarkPost, getBookmarks, getTimeline, getPostsByUsername,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getPosts);
router.get('/bookmarks/me', protect, getBookmarks);
router.get('/feed/timeline', protect, getTimeline);
router.get('/user/:username', optionalAuth, getPostsByUsername);
router.get('/:id', optionalAuth, getPost);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.put('/:id/repost', protect, repost);
router.put('/:id/bookmark', protect, bookmarkPost);

module.exports = router;
