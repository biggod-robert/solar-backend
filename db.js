const { Pool } = require('pg');

console.log('📡 DATABASE_URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool
  .query('SELECT NOW()')
  .then(res => console.log('✅ Conectado a PostgreSQL remoto:', res.rows[0]))
  .catch(err => console.error('❌ Error al conectar con PostgreSQL:', err));

module.exports = pool;
