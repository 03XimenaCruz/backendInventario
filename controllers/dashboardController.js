const db = require('../config/db');
const { generateInventoryPDF, generateMovementsPDF, generateLowStockPDF } = require('../utils/pdfGenerator');

// Obtener estadísticas del dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    
    // ⭐ Stats generales con filtro de almacén
    let totalProducts, lowStockProducts;
    
    if (warehouse_id) {
      [totalProducts] = await db.query('CALL sp_count_total_products_by_warehouse(?)', [warehouse_id]);
      [lowStockProducts] = await db.query('CALL sp_count_low_stock_products_by_warehouse(?)', [warehouse_id]);
    } else {
      [totalProducts] = await db.query('CALL sp_count_total_products()');
      [lowStockProducts] = await db.query('CALL sp_count_low_stock_products()');
    }
    
    // Total de usuarios (siempre global, no cambia por almacén)
    const [totalUsers] = await db.query('CALL sp_count_total_users()');
    
    // ⭐ Gráficas y alertas con filtro
    let topExitsMonth, lowExitsMonth, lowStockAlerts, excessStockAlerts;
    
    if (warehouse_id) {
      [topExitsMonth] = await db.query('CALL sp_get_top_exits_month_by_warehouse(?)', [warehouse_id]);
      [lowExitsMonth] = await db.query('CALL sp_get_low_exits_month_by_warehouse(?)', [warehouse_id]);
      [lowStockAlerts] = await db.query('CALL sp_get_low_stock_alerts_by_warehouse(?)', [warehouse_id]);
      [excessStockAlerts] = await db.query('CALL sp_get_excess_stock_alerts_by_warehouse(?)', [warehouse_id]);
    } else {
      [topExitsMonth] = await db.query('CALL sp_get_top_exits_month()');
      [lowExitsMonth] = await db.query('CALL sp_get_low_exits_month()');
      [lowStockAlerts] = await db.query('CALL sp_get_low_stock_alerts()');
      [excessStockAlerts] = await db.query('CALL sp_get_excess_stock_alerts()');
    }
    
    res.json({
      totalProducts: totalProducts[0][0].total,
      lowStockProducts: lowStockProducts[0][0].total,
      totalUsers: totalUsers[0][0].total,
      topExitsMonth: topExitsMonth[0],
      lowExitsMonth: lowExitsMonth[0],
      lowStockAlerts: lowStockAlerts[0],
      excessStockAlerts: excessStockAlerts[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// NUEVO: Obtener almacenes activos
exports.getActiveWarehouses = async (req, res) => {
  try {
    const [warehouses] = await db.query('CALL sp_get_all_warehouses()');
    res.json(warehouses[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener almacenes' });
  }
};

// NUEVO: Obtener fecha del primer registro (producto o movimiento)
exports.getFirstRecordDate = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT MIN(fecha_minima) as first_date FROM (
        SELECT MIN(created_at) as fecha_minima FROM producto WHERE activo = 1
        UNION ALL
        SELECT MIN(created_at) as fecha_minima FROM movimiento
      ) as fechas
    `);
    
    res.json({ 
      firstDate: result[0].first_date,
      year: result[0].first_date ? new Date(result[0].first_date).getFullYear() : new Date().getFullYear(),
      month: result[0].first_date ? new Date(result[0].first_date).getMonth() + 1 : new Date().getMonth() + 1
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener fecha inicial' });
  }
};

// Generar reporte de inventario por mes (con filtro de almacén)
exports.getInventoryReportByMonth = async (req, res) => {
  try {
    const { year, month, format, warehouse_id } = req.query;
    
    // Validar que haya datos en ese mes
    const [hasData] = await db.query(`
      SELECT COUNT(*) as count FROM producto 
      WHERE activo = 1 
      AND YEAR(created_at) <= ? 
      AND (YEAR(created_at) < ? OR MONTH(created_at) <= ?)
      ${warehouse_id ? 'AND warehouse_id = ?' : ''}
    `, warehouse_id ? [year, year, month, warehouse_id] : [year, year, month]);
    
    if (hasData[0].count === 0) {
      return res.status(400).json({ 
        message: 'No hay datos disponibles para el período seleccionado' 
      });
    }
    
    // Llamar al procedimiento almacenado con warehouse_id
    const [products] = await db.query(
      'CALL sp_get_inventory_report_by_month(?, ?, ?)',
      [year || null, month || null, warehouse_id || null]
    );
    
    if (format === 'pdf') {
      const title = `Reporte_Inventario_${year}_${month}${warehouse_id ? '_Almacen_' + warehouse_id : ''}`;
      return generateInventoryPDF(products[0], res, title);
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

// Reporte de productos con bajo stock (con filtro de almacén)
exports.getLowStockReport = async (req, res) => {
  try {
    const { format, warehouse_id } = req.query;
    
    const [products] = await db.query(
      'CALL sp_get_low_stock_report(?)',
      [warehouse_id || null]
    );
    
    if (products[0].length === 0) {
      return res.status(400).json({ 
        message: 'No hay productos con stock bajo en este almacén' 
      });
    }
    
    if (format === 'pdf') {
      return generateLowStockPDF(products[0], res, 'Reporte_Stock_Bajo');
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

// Reporte de movimientos del mes (con filtro de almacén)
exports.getMovementsReportByMonth = async (req, res) => {
  try {
    const { year, month, format, warehouse_id } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ message: 'Año y mes son requeridos' });
    }
    
    // Validar que haya movimientos en ese mes
    const [hasMovements] = await db.query(`
      SELECT COUNT(*) as count FROM movimiento 
      WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
      ${warehouse_id ? 'AND warehouse_id = ?' : ''}
    `, warehouse_id ? [year, month, warehouse_id] : [year, month]);
    
    if (hasMovements[0].count === 0) {
      return res.status(400).json({ 
        message: 'No hay movimientos registrados en el período seleccionado' 
      });
    }
    
    const [movements] = await db.query(
      'CALL sp_get_movements_report_by_month(?, ?, ?)',
      [parseInt(year), parseInt(month), warehouse_id || null]
    );
    
    if (format === 'pdf') {
       let warehouseName = 'Todos los almacenes';
      const title = `Reporte_Movimientos_${year}_${month}${warehouse_id ? '_Almacen_' + warehouse_id : ''}`;
      return generateMovementsPDF(movements[0], res, title);
    }
    
    res.json(movements[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};