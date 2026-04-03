const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getWallet,
    deposit,
    withdraw,
    getTransactions,
    toggle2FA,
} = require('../controllers/walletController');

// All wallet routes are protected
router.get('/', protect, getWallet);
router.post('/deposit', protect, deposit);
router.post('/withdraw', protect, withdraw);
router.get('/transactions', protect, getTransactions);
router.post('/toggle-2fa', protect, toggle2FA);

module.exports = router;
