
require('dotenv').config({ override: true });
const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Verificación inmediata de conexión
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error al conectar con PostgreSQL:', err);
  } else {
    console.log('✅ Conexión con PostgreSQL establecida:', res.rows[0]);
  }
});

module.exports = db;
