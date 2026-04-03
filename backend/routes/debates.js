const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
    createDebate,
    getDebates,
    getDebate,
    joinDebate,
    startDebate,
    sendMessage,
    getMessages,
    spectateDebate,
    castVote,
    getVotes,
    cancelDebate,
    getCountryLeaderboard,
    getTrendingByCountry,
    getCountryStats,
} = require('../controllers/debateController');

// Public routes — country-specific
router.get('/leaderboard/:country', getCountryLeaderboard);
router.get('/trending/:country', getTrendingByCountry);
router.get('/stats/countries', getCountryStats);

// Public routes
router.get('/', optionalAuth, getDebates);
router.get('/:id', optionalAuth, getDebate);
router.get('/:id/messages', getMessages);
router.get('/:id/votes', optionalAuth, getVotes);

// Protected routes
router.post('/', protect, createDebate);
router.post('/:id/join', protect, joinDebate);
router.post('/:id/start', protect, startDebate);
router.post('/:id/message', protect, sendMessage);
router.post('/:id/spectate', protect, spectateDebate);
router.post('/:id/vote', protect, castVote);
router.post('/:id/cancel', protect, cancelDebate);

module.exports = router;
