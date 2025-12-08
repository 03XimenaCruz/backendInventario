const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/products - Obtener todos los productos
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Obtener un producto
router.get('/:id', productController.getProductById);

// POST /api/products - Crear producto (solo admin)
router.post('/', isAdmin, productController.createProduct);

// PUT /api/products/:id - Actualizar producto (solo admin)
router.put('/:id', isAdmin, productController.updateProduct);

// DELETE /api/products/:id - Eliminar producto (solo admin)
router.delete('/:id', isAdmin, productController.deleteProduct);

module.exports = router;