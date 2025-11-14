const bcrypt = require("bcrypt"),
    pool = require("../db");
async function seedAdmin() {
    const o = process.env.ADMIN_USER,
        r = process.env.ADMIN_PASS,
        s = process.env.ADMIN_EMAIL;
    if (!o || !r || !s) return void console.warn("⚠️ Debes definir ADMIN_USER, ADMIN_PASS y ADMIN_EMAIL");
    const { rowCount: e } = await pool.query("SELECT 1 FROM usuarios WHERE rol = 'administrador' LIMIT 1");
    if (e > 0) return void console.log("🛡️ Usuario administrador ya existe");
    const i = await bcrypt.hash(r, 10);
    await pool.query(
        "INSERT INTO usuarios (usuario, nombre, cedula, password_hash, rol, email)\n     VALUES ($1,$2,$3,$4,$5,$6)",
        [o, "Administrador", "0000000000", i, "administrador", s]
    ),
        console.log("✅ Usuario administrador creado:", o);
}
module.exports = seedAdmin;
