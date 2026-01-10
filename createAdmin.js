const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const hash = await bcrypt.hash('admin123', 10);
  
  console.log('Hash generado:', hash);
  
  // Eliminar admin anterior si existe
  await connection.query('DELETE FROM usuario WHERE correo = ?', ['administrador@sistema.com']);
  
  // Insertar nuevo admin
  await connection.query(
    'INSERT INTO usuario (nombre, correo, contrasenia, rol) VALUES (?, ?, ?, ?)',
    ['Administrador', 'administrador@sistema.com', hash, 'administrador']
  );
  
  console.log('✅ Administrador creado exitosamente');
  
  // Verificar
  const [users] = await connection.query('SELECT * FROM usuario WHERE correo = ?', ['administrador@sistema.com']);
  console.log('Usuario creado:', users[0]);
  
  await connection.end();
}

createAdmin().catch(console.error);