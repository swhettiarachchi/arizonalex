const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe, googleAuth, verify2FA } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post(
    '/register',
    authLimiter,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    register
);

router.post('/login', authLimiter, login);
router.post('/verify-2fa', authLimiter, verify2FA);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

module.exports = router;
