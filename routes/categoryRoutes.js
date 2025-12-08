const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/categories - Obtener todas las categorías
router.get('/', categoryController.getAllCategories);

// GET /api/categories/:id - Obtener una categoría
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Crear categoría (solo admin)
router.post('/', isAdmin, categoryController.createCategory);

// PUT /api/categories/:id - Actualizar categoría (solo admin)
router.put('/:id', isAdmin, categoryController.updateCategory);

// DELETE /api/categories/:id - Eliminar categoría (solo admin)
router.delete('/:id', isAdmin, categoryController.deleteCategory);

module.exports = router;