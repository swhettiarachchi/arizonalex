const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    register
);

router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
