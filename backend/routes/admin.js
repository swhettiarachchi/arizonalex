const router = require('express').Router();
const { getStats, getAdminUsers, deleteUser, verifyUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.get('/users', getAdminUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/verify', verifyUser);

module.exports = router;
