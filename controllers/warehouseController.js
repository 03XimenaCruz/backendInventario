const db = require('../config/db');

// Obtener todos los almacenes
exports.getAllWarehouses = async (req, res) => {
  try {
    const [warehouses] = await db.query('CALL sp_get_all_warehouses()');
    res.json(warehouses[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener almacenes' });
  }
};

// Obtener un almacén
exports.getWarehouseById = async (req, res) => {
  try {
    const [warehouses] = await db.query('CALL sp_get_warehouse_by_id(?)', [req.params.id]);
    const warehouseResult = warehouses[0];
    
    if (warehouseResult.length === 0) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json(warehouseResult[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener almacén' });
  }
};

// Crear almacén
exports.createWarehouse = async (req, res) => {
  try {
    const { nombre, ubicacion } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    
    const [result] = await db.query(
      'CALL sp_create_warehouse(?, ?)',
      [nombre, ubicacion || null]
    );
    
    res.status(201).json({ 
      message: 'Almacén creado exitosamente',
      id: result[0][0].id 
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El almacén ya existe' });
    }
    res.status(500).json({ message: 'Error al crear almacén' });
  }
};

// Actualizar almacén
exports.updateWarehouse = async (req, res) => {
  try {
    const { nombre, ubicacion } = req.body;
    const { id } = req.params;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    
    const [result] = await db.query(
      'CALL sp_update_warehouse(?, ?, ?)',
      [id, nombre, ubicacion || null]
    );
    
    if (result[0][0].affected_rows === 0) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json({ message: 'Almacén actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El almacén ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar almacén' });
  }
};

// Eliminar almacén (soft delete)
exports.deleteWarehouse = async (req, res) => {
  try {
    const [result] = await db.query('CALL sp_delete_warehouse(?)', [req.params.id]);
    
    if (result[0][0].affected_rows === 0) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json({ message: 'Almacén eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar almacén' });
  }
};