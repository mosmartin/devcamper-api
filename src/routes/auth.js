const express = require('express');
const { register, login, me, forgotPassword } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.post('/forgotpassword', forgotPassword);

module.exports = router;
