require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
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
