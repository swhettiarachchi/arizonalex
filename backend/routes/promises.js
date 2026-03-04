const router = require('express').Router();
const { getPromises, createPromise, updatePromise } = require('../controllers/promiseController');
const { protect } = require('../middleware/auth');

router.get('/', getPromises);
router.post('/', protect, createPromise);
router.put('/:id', protect, updatePromise);

module.exports = router;
