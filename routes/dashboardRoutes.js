const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/dashboard/stats - Obtener estadísticas
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/inventory-report-month - Reporte de inventario por mes
router.get('/inventory-report-month', dashboardController.getInventoryReportByMonth);

// GET /api/dashboard/low-stock-report - Reporte de stock bajo
router.get('/low-stock-report', dashboardController.getLowStockReport);

// GET /api/dashboard/movements-report-month - Reporte de movimientos del mes
router.get('/movements-report-month', dashboardController.getMovementsReportByMonth);

module.exports = router;