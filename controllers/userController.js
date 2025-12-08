const bcrypt = require('bcrypt');
const db = require('../config/db');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('CALL sp_get_all_users()');
    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Obtener un usuario
exports.getUserById = async (req, res) => {
  try {
    const [users] = await db.query('CALL sp_get_user_by_id(?)', [req.params.id]);
    const userResult = users[0];
    
    if (userResult.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(userResult[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

// Crear usuario
exports.createUser = async (req, res) => {
  try {
    const { nombre, correo, contrasenia, rol } = req.body;
    
    // Validaciones
    if (!nombre || !correo || !contrasenia || !rol) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    if (!['administrador', 'colaborador'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }
    
    // Verificar si el correo ya existe
    const [existingCheck] = await db.query('CALL sp_check_email_exists(?, NULL)', [correo]);
    if (existingCheck[0][0].count > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasenia, 10);
    
    // Crear usuario
    const [result] = await db.query(
      'CALL sp_create_user(?, ?, ?, ?)',
      [nombre, correo, hashedPassword, rol]
    );
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      id: result[0][0].id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { nombre, correo, contrasenia, rol } = req.body;
    const { id } = req.params;
    
    // Validaciones
    if (!['administrador', 'colaborador'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }
    
    // Verificar si el correo ya existe (excluyendo el usuario actual)
    const [existingCheck] = await db.query('CALL sp_check_email_exists(?, ?)', [correo, id]);
    if (existingCheck[0][0].count > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }
    
    let result;
    
    // Si se proporciona contraseña, encriptarla y actualizarla
    if (contrasenia && contrasenia.trim() !== '') {
      const hashedPassword = await bcrypt.hash(contrasenia, 10);
      [result] = await db.query(
        'CALL sp_update_user_with_password(?, ?, ?, ?, ?)',
        [id, nombre, correo, hashedPassword, rol]
      );
    } else {
      [result] = await db.query(
        'CALL sp_update_user_without_password(?, ?, ?, ?)',
        [id, nombre, correo, rol]
      );
    }
    
    if (result[0][0].affected_rows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir eliminar el propio usuario
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }
    
    const [result] = await db.query('CALL sp_delete_user(?)', [id]);
    
    if (result[0][0].affected_rows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'No se puede eliminar. El usuario tiene movimientos registrados' });
    }
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};