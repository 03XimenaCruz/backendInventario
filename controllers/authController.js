const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');


exports.login = async (req, res) => {
  try {
    const { correo, contrasenia } = req.body;

    const [users] = await db.query('CALL sp_get_user_by_email(?)', [correo]);
    const userResult = users[0];

    if (userResult.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = userResult[0];

    const isPasswordValid = await bcrypt.compare(contrasenia, user.contrasenia);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, correo: user.correo, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const [users] = await db.query('CALL sp_get_user_by_id(?)', [req.user.id]);
    const userResult = users[0];
    
    if (userResult.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user: userResult[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};