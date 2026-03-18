const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Poll = require('../models/Poll');
const Event = require('../models/Event');

router.get('/', async (req, res) => {
    try {
        const [userCount, pollCount, eventCount] = await Promise.all([
            User.countDocuments(),
            Poll.countDocuments(),
            Event.countDocuments()
        ]);

        res.json({
            users: userCount,
            polls: pollCount,
            events: eventCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

module.exports = router;
