const express = require('express');
const router = express.Router();
const controller = require('../controllers/achievementController');
const { verifyJWT } = require('../middleware/authMiddleware');
router.get('/', verifyJWT, controller.getAchievements);
router.post('/unlock', verifyJWT, controller.unlockAchievement);
module.exports = router;
