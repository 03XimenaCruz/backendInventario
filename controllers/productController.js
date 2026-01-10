const db = require('../config/db');

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const { warehouse_id, search, category_id } = req.query;
    
    let result;
    
    if (category_id) {
      [result] = await db.query('CALL sp_get_products_by_category(?)', [category_id]);
    } else if (warehouse_id) {
      [result] = await db.query('CALL sp_get_products_by_warehouse(?)', [warehouse_id]);
    } else if (search) {
      [result] = await db.query('CALL sp_search_products_by_name(?)', [search]);
    } else {
      [result] = await db.query('CALL sp_get_all_products()');
    }
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Obtener un producto
exports.getProductById = async (req, res) => {
  try {
    const [products] = await db.query('CALL sp_get_product_by_id(?)', [req.params.id]);
    const productResult = products[0];
    
    if (productResult.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json(productResult[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

// Crear producto
exports.createProduct = async (req, res) => {
  try {
    const { sku, nombre, category_id, warehouse_id, stock_minimo, stock_maximo } = req.body;
    
    // Validaciones
    if (!sku || !nombre || !category_id || stock_minimo == null || stock_maximo == null) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    if (stock_minimo < 0 || stock_maximo < 0) {
      return res.status(400).json({ message: 'Los stocks deben ser números positivos' });
    }
    
    if (!Number.isInteger(stock_minimo) || !Number.isInteger(stock_maximo)) {
      return res.status(400).json({ message: 'Los stocks deben ser números enteros' });
    }
    
    if (stock_minimo > stock_maximo) {
      return res.status(400).json({ message: 'El stock mínimo no puede ser mayor al máximo' });
    }
    
    // Verificar SKU único
    const [existingCheck] = await db.query('CALL sp_check_sku_exists(?, NULL)', [sku]);
    if (existingCheck[0][0].count > 0) {
      return res.status(400).json({ message: 'El SKU ya existe' });
    }
    
    // Si no se proporciona warehouse_id, usar NULL o el primer almacén disponible
    let finalWarehouseId = warehouse_id || null;
    
    // Si warehouse_id es requerido y no se proporciona, obtener el primero
    if (!finalWarehouseId) {
      const [warehouses] = await db.query('SELECT id FROM warehouses LIMIT 1');
      if (warehouses.length === 0) {
        return res.status(400).json({ message: 'Debe crear al menos un almacén primero' });
      }
      finalWarehouseId = warehouses[0].id;
    }
    
    // Crear producto
    const [result] = await db.query(
      'CALL sp_create_product(?, ?, ?, ?, ?, ?)',
      [sku, nombre, category_id, finalWarehouseId, stock_minimo, stock_maximo]
    );
    
    res.status(201).json({ 
      message: 'Producto guardado exitosamente',
      id: result[0][0].id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

// Actualizar producto
exports.updateProduct = async (req, res) => {
  try {
    const { sku, nombre, category_id, warehouse_id, stock_minimo, stock_maximo } = req.body;
    const { id } = req.params;
    
    // Validaciones
    if (stock_minimo < 0 || stock_maximo < 0) {
      return res.status(400).json({ message: 'Los stocks deben ser números positivos' });
    }
    
    if (!Number.isInteger(stock_minimo) || !Number.isInteger(stock_maximo)) {
      return res.status(400).json({ message: 'Los stocks deben ser números enteros' });
    }
    
    if (stock_minimo > stock_maximo) {
      return res.status(400).json({ message: 'El stock mínimo no puede ser mayor al máximo' });
    }
    
    // Verificar SKU único (excluyendo el producto actual)
    const [existingCheck] = await db.query('CALL sp_check_sku_exists(?, ?)', [sku, id]);
    if (existingCheck[0][0].count > 0) {
      return res.status(400).json({ message: 'El SKU ya existe' });
    }
    
    // Si no se proporciona warehouse_id, obtener el actual del producto
    let finalWarehouseId = warehouse_id;
    if (!finalWarehouseId) {
      const [currentProduct] = await db.query('SELECT warehouse_id FROM products WHERE id = ?', [id]);
      if (currentProduct.length > 0) {
        finalWarehouseId = currentProduct[0].warehouse_id;
      }
    }
    
    const [result] = await db.query(
      'CALL sp_update_product(?, ?, ?, ?, ?, ?, ?)',
      [id, sku, nombre, category_id, finalWarehouseId, stock_minimo, stock_maximo]
    );
    
    if (result[0][0].affected_rows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// Eliminar producto (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const [result] = await db.query('CALL sp_delete_product(?)', [req.params.id]);
    
    if (result[0][0].affected_rows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};