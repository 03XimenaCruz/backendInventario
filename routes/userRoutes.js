const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación y ser administrador
router.use(verifyToken, isAdmin);

// GET /api/users - Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Obtener un usuario
router.get('/:id', userController.getUserById);

// POST /api/users - Crear usuario
router.post('/', userController.createUser);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', userController.deleteUser);

module.exports = router;