const { Pool } = require('pg');

// DEBUG: confirma qué URL carga
console.log('📡 DATABASE_URL:', process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL || '';
// Si la URL incluye 'localhost', no usamos SSL; si no, activamos SSL
const useSSL = !connectionString.includes('localhost');

const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool
  .query('SELECT NOW()')
  .then(res => console.log('✅ Conectado a PostgreSQL remoto:', res.rows[0]))
  .catch(err => console.error('❌ Error al conectar con PostgreSQL:', err));

module.exports = pool;


