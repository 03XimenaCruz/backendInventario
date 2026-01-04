const db = require('../config/db');
const { generateInventoryPDF, generateMovementsPDF, generateLowStockPDF } = require('../utils/pdfGenerator');

// Obtener estadísticas del dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    // Total de productos
    const [totalProducts] = await db.query('CALL sp_count_total_products()');
    
    // Productos con stock bajo
    const [lowStockProducts] = await db.query('CALL sp_count_low_stock_products()');
    
    // Total de usuarios
    const [totalUsers] = await db.query('CALL sp_count_total_users()');
    
    // Productos con más salidas del mes
    const [topExitsMonth] = await db.query('CALL sp_get_top_exits_month()');
    
    // Productos con menos salidas del mes
    const [lowExitsMonth] = await db.query('CALL sp_get_low_exits_month()');
    
    // Alertas de stock bajo
    const [lowStockAlerts] = await db.query('CALL sp_get_low_stock_alerts()');
    
    res.json({
      totalProducts: totalProducts[0][0].total,
      lowStockProducts: lowStockProducts[0][0].total,
      totalUsers: totalUsers[0][0].total,
      topExitsMonth: topExitsMonth[0],
      lowExitsMonth: lowExitsMonth[0],
      lowStockAlerts: lowStockAlerts[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// Generar reporte de inventario por mes
exports.getInventoryReportByMonth = async (req, res) => {
  try {
    const { year, month, format } = req.query;
    
    const [products] = await db.query(
      'CALL sp_get_inventory_report_by_month(?, ?)',
      [year || null, month || null]
    );
    
    // Si el formato es PDF, generar PDF
    if (format === 'pdf') {
      const title = `Reporte_Inventario_${year}_${month}`;
      return generateInventoryPDF(products[0], res, title);
    }
    
    // Por defecto, retornar JSON para CSV
    res.json(products[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

// Reporte de productos con bajo stock
exports.getLowStockReport = async (req, res) => {
  try {
    const { format } = req.query;
    
    const [products] = await db.query('CALL sp_get_low_stock_report()');
    
    // Si el formato es PDF, generar PDF
    if (format === 'pdf') {
      return generateLowStockPDF(products[0], res, 'Reporte_Stock_Bajo');
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

// Reporte de movimientos del mes
exports.getMovementsReportByMonth = async (req, res) => {
  try {
    const { year, month, format } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ message: 'Año y mes son requeridos' });
    }
    
    const [movements] = await db.query(
      'CALL sp_get_movements_report_by_month(?, ?)',
      [parseInt(year), parseInt(month)]
    );
    
    // Si el formato es PDF, generar PDF
    if (format === 'pdf') {
      const title = `Reporte_Movimientos_${year}_${month}`;
      return generateMovementsPDF(movements[0], res, title);
    }
    
    res.json(movements[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};