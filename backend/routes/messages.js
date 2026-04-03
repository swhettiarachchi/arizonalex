const router = require('express').Router();
const ctrl = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect); // All message routes require auth

// ── Conversations ──
router.get('/conversations', ctrl.getConversations);
router.post('/conversations', ctrl.createConversation);
router.get('/conversations/:id', ctrl.getMessages);
router.post('/conversations/:id', ctrl.sendMessage);
router.post('/conversations/:id/pin', ctrl.pinConversation);
router.post('/conversations/:id/mute', ctrl.muteConversation);
router.post('/conversations/:id/archive', ctrl.archiveConversation);

// ── Groups ──
router.post('/groups', ctrl.createGroup);
router.put('/groups/:id', ctrl.updateGroup);
router.post('/groups/:id/members', ctrl.addMembers);
router.delete('/groups/:id/members/:userId', ctrl.removeMember);
router.post('/groups/:id/leave', ctrl.leaveGroup);
router.delete('/groups/:id', ctrl.deleteGroup);

// ── Message actions ──
router.post('/:messageId/react', ctrl.reactToMessage);
router.post('/:messageId/pin', ctrl.pinMessage);
router.put('/:messageId/edit', ctrl.editMessage);
router.delete('/:messageId', ctrl.deleteMessage);

// ── Search ──
router.get('/search', ctrl.searchMessages);
router.get('/users/search', ctrl.searchUsers);

// ── Block ──
router.post('/block', ctrl.blockUser);
router.post('/unblock', ctrl.unblockUser);
router.get('/blocked', ctrl.getBlockedUsers);

// ── Calls ──
router.post('/calls', ctrl.logCall);
router.put('/calls/:id', ctrl.updateCall);

module.exports = router;
