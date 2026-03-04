const router = require('express').Router();
const { getConversations, getMessages, sendMessage, createConversation } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect); // All message routes require auth
router.get('/conversations', getConversations);
router.get('/conversations/:id', getMessages);
router.post('/conversations/:id', sendMessage);
router.post('/conversations', createConversation);

module.exports = router;
