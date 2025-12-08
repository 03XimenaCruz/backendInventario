const db = require('../config/db');

// Obtener todos los movimientos
exports.getAllMovements = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    
    let result;
    
    if (warehouse_id) {
      [result] = await db.query('CALL sp_get_movements_by_warehouse(?)', [warehouse_id]);
    } else {
      [result] = await db.query('CALL sp_get_all_movements()');
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener movimientos' });
  }
};

// Crear movimiento (entrada o salida)
exports.createMovement = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { tipo_movimiento, product_id, cantidad, nota } = req.body;
    const user_id = req.user.id;
    
    // Validaciones
    if (!tipo_movimiento || !product_id || !cantidad) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    if (cantidad <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser un número positivo' });
    }
    
    if (!Number.isInteger(cantidad)) {
      return res.status(400).json({ message: 'La cantidad debe ser un número entero' });
    }
    
    await connection.beginTransaction();
    
    // Obtener el producto
    const [products] = await connection.query('CALL sp_get_product_by_id(?)', [product_id]);
    const productResult = products[0];
    
    if (productResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const product = productResult[0];
    const stock_anterior = product.stock;
    let stock_actual = stock_anterior;
    
    // Calcular nuevo stock
    if (tipo_movimiento === 'entrada') {
      stock_actual = stock_anterior + cantidad;
    } else if (tipo_movimiento === 'salida') {
      if (stock_anterior < cantidad) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Stock insuficiente. Disponible: ${stock_anterior} unidades` 
        });
      }
      stock_actual = stock_anterior - cantidad;
    }
    
    // Actualizar stock del producto
    await connection.query('CALL sp_update_product_stock(?, ?)', [product_id, stock_actual]);
    
    // Registrar movimiento
    const [result] = await connection.query(
      'CALL sp_create_movement(?, ?, ?, ?, ?, ?, ?, ?)',
      [tipo_movimiento, product_id, product.warehouse_id, cantidad, stock_anterior, stock_actual, nota, user_id]
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      message: 'Movimiento registrado exitosamente',
      id: result[0][0].id,
      stock_actual
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error al registrar movimiento' });
  } finally {
    connection.release();
  }
};

// Obtener movimiento por ID
exports.getMovementById = async (req, res) => {
  try {
    const [movements] = await db.query('CALL sp_get_movement_by_id(?)', [req.params.id]);
    const movementResult = movements[0];
    
    if (movementResult.length === 0) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    
    res.json(movementResult[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener movimiento' });
  }
};