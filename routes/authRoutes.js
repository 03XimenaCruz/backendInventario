const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/verify - Verificar token
router.get('/verify', verifyToken, authController.verifyToken);

module.exports = router;