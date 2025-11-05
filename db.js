const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || "";
console.log("📡 DATABASE_URL set?", !!connectionString);

const useSSL = connectionString && !connectionString.includes("localhost");

const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

// prueba de conexión inicial (opcional en prod, útil en deploy)
pool
  .query("SELECT NOW()")
  .then((res) => console.log("✅ Conectado a PostgreSQL remoto:", res.rows[0]))
  .catch((err) => console.error("❌ Error al conectar con PostgreSQL:", err));

module.exports = pool;
