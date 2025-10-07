const bcrypt = require('bcrypt');
const pool   = require('../db');

async function seedAdmin() {
  // Lee credenciales desde variables de entorno
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;
  const email = process.env.ADMIN_EMAIL;

   if (!user || !pass || !email) {
     console.warn('⚠️ Debes definir ADMIN_USER, ADMIN_PASS y ADMIN_EMAIL');
     return;
   }

  // ¿Ya existe un admin?
  const { rowCount } = await pool.query(
    "SELECT 1 FROM usuarios WHERE rol = 'administrador' LIMIT 1"
  );
  if (rowCount > 0) {
    console.log('🛡️ Usuario administrador ya existe');
    return;
  }

  // Si no existe, créalo
  const hash = await bcrypt.hash(pass, 10);
  await pool.query(
    `INSERT INTO usuarios (usuario, nombre, cedula, password_hash, rol, email)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [user, 'Administrador', '0000000000', hash, 'administrador', email]
  );
  console.log('✅ Usuario administrador creado:', user);
}

module.exports = seedAdmin;