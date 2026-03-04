const router = require('express').Router();
const { getTrending, search } = require('../controllers/exploreController');

router.get('/trending', getTrending);
router.get('/search', search);

module.exports = router;
