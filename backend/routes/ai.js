const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { generate, getStatus } = require('../controllers/aiController');

// Status endpoint — public
router.get('/status', getStatus);

// Generate — requires auth
router.post('/generate', protect, generate);

module.exports = router;
