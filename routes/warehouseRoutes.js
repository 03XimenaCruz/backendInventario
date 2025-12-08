const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/warehouses - Obtener todos los almacenes
router.get('/', warehouseController.getAllWarehouses);

// GET /api/warehouses/:id - Obtener un almacén
router.get('/:id', warehouseController.getWarehouseById);

// POST /api/warehouses - Crear almacén (solo admin)
router.post('/', isAdmin, warehouseController.createWarehouse);

// PUT /api/warehouses/:id - Actualizar almacén (solo admin)
router.put('/:id', isAdmin, warehouseController.updateWarehouse);

// DELETE /api/warehouses/:id - Eliminar almacén (solo admin)
router.delete('/:id', isAdmin, warehouseController.deleteWarehouse);

module.exports = router;