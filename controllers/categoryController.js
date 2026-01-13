const db = require('../config/db');

// Obtener todas las categorías o por almacen
exports.getAllCategories = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    
    let result;
    
    if (warehouse_id) {
      [result] = await db.query('CALL sp_get_categories_by_warehouse(?)', [warehouse_id]);
    } else {
      [result] = await db.query('CALL sp_get_all_categories()');
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

// Obtener una categoría
exports.getCategoryById = async (req, res) => {
  try {
    const [categories] = await db.query('CALL sp_get_category_by_id(?)', [req.params.id]);
    const categoryResult = categories[0];
    
    if (categoryResult.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    res.json(categoryResult[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener categoría' });
  }
};

// Crear categoría
exports.createCategory = async (req, res) => {
  try {
    const { nombre, warehouse_id } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    
    const [result] = await db.query('CALL sp_create_category(?, ?)', [nombre, warehouse_id || null]);
    
    res.status(201).json({ 
      message: 'Categoría creada exitosamente',
      id: result[0][0].id 
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }
    res.status(500).json({ message: 'Error al crear categoría' });
  }
};

// Actualizar categoría
exports.updateCategory = async (req, res) => {
  try {
    const { nombre, warehouse_id } = req.body;
    const { id } = req.params;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    
    const [result] = await db.query('CALL sp_update_category(?, ?, ?)', [id, nombre, warehouse_id || null]);
    
    if (result[0][0].affected_rows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    res.json({ message: 'Categoría actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }
    res.status(500).json({ message: 'Error al actualizar categoría' });
  }
};

// Eliminar categoría (soft delete)
exports.deleteCategory = async (req, res) => {
  try {
    const [result] = await db.query('CALL sp_delete_category(?)', [req.params.id]);
    
    if (result[0][0].affected_rows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.sqlState === '45000') {
      return res.status(400).json({ 
        message: error.sqlMessage || 'No se puede eliminar la categoría porque tiene productos asociados'
      });
    }
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
};