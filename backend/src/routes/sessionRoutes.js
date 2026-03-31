const express = require('express');
const router = express.Router();
const controller = require('../controllers/sessionController');
const { verifyJWT } = require('../middleware/authMiddleware');
router.post('/', verifyJWT, controller.saveSession);
router.get('/', verifyJWT, controller.getSessions);
router.get('/:id', verifyJWT, controller.getSessionById);
module.exports = router;
