const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');
const { verifyToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/movements - Obtener todos los movimientos
router.get('/', movementController.getAllMovements);

// GET /api/movements/:id - Obtener un movimiento
router.get('/:id', movementController.getMovementById);

// POST /api/movements - Crear movimiento (entrada/salida)
router.post('/', movementController.createMovement);

module.exports = router;