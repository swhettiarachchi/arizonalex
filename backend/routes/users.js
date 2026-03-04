const router = require('express').Router();
const { getUsers, getUser, getUserByUsername, updateUser, followUser, unfollowUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', getUsers);
router.get('/username/:username', getUserByUsername);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.put('/:id/follow', protect, followUser);
router.put('/:id/unfollow', protect, unfollowUser);

module.exports = router;
