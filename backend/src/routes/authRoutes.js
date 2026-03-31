const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { verifyJWT } = require('../middleware/authMiddleware');
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', verifyJWT, controller.getMe);
module.exports = router;
