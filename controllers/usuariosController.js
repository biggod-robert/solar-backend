const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

function validarRequest(req, res) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : res.status(400).json({ errores: errors.array() });
}

async function obtenerUsuarioPorId(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT id, usuario, nombre, cedula, email, rol FROM usuarios WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error en obtenerUsuarioPorId:", err);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
}

const registrarUsuario = async (req, res) => {
  const { usuario, cedula, email, password } = req.body;
  console.log(`📝 Intentando registrar: ${usuario}`);
  try {
    const exists = await db.query("SELECT 1 FROM usuarios WHERE usuario = $1", [usuario]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO usuarios (usuario, nombre, cedula, email, password_hash, rol) VALUES ($1, $2, $3, $4, $5, $6)",
      [usuario, "Por definir", cedula, email, hash, "cotizador"]
    );
    return res.status(201).json({ mensaje: "Usuario registrado exitosamente" });
  } catch (err) {
    console.error("❌ Error en registrarUsuario:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Usuario, cédula o email duplicado" });
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

const loginUsuario = async (req, res) => {
  const { usuario, password } = req.body;
  console.log(`🔍 Intentando login: ${usuario}`);
  try {
    const result = await db.query("SELECT * FROM usuarios WHERE usuario = $1", [usuario]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: "2h" });
    return res.status(200).json({
      id: user.id,
      usuario: user.usuario,
      nombre: user.nombre,
      rol: user.rol,
      token,
    });
  } catch (err) {
    console.error("❌ Error en loginUsuario:", err);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

const crearAdmin = async (req, res) => {
  try {
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;
    const exists = await db.query("SELECT 1 FROM usuarios WHERE rol = $1", ["administrador"]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ mensaje: "Administrador ya existe" });
    }
    const hash = await bcrypt.hash(adminPass, 10);
    await db.query(
      "INSERT INTO usuarios (usuario, nombre, cedula, password_hash, rol) VALUES ($1, $2, $3, $4, $5)",
      [adminUser, "Administrador", "0000000000", hash, "administrador"]
    );
    return res.status(201).json({ mensaje: "Administrador creado" });
  } catch (err) {
    console.error("❌ Error crearAdmin:", err);
    return res.status(500).json({ error: "Error interno al crear admin" });
  }
};

const actualizarUsuario = async (req, res) => {
  console.log("🎯 controlador actualizarUsuario:", req.method, req.originalUrl, "body=", req.body);
  const idParam = Number(req.params.id);
  const userId = req.user.id;
  let targetId;

  if (req.user.rol === "administrador") {
    targetId = idParam;
  } else {
    if (userId !== idParam) {
      return res.status(403).json({ msg: "No tienes permisos para actualizar este usuario" });
    }
    targetId = userId;
  }

  const { nombre, email, cedula } = req.body;
  try {
    const result = await db.query(
      `UPDATE usuarios
       SET nombre = $1,
           email  = $2,
           cedula = $3
       WHERE id = $4
       RETURNING id, usuario, nombre, email, cedula, rol;`,
      [nombre, email, cedula, targetId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error actualizando usuario:", err);
    return res.status(500).json({ msg: "Error interno", error: err.message });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  crearAdmin,
  obtenerUsuarioPorId,
  actualizarUsuario,
};
