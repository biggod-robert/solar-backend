const db       = require('../db');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { validationResult } = require('express-validator');
/**
 * Helper para enviar errores de validación
 */
function validarRequest(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  return null;
}
/**
 * GET /api/usuarios/:id
 * Recupera usuario por su PK
 */
async function obtenerUsuarioPorId(req, res) {
  // validamos token antes con validarJWT
  try {
    const { id } = req.params;
    const resultado = await db.query(
      `SELECT id, usuario, nombre, cedula, email, rol
         FROM usuarios
        WHERE id = $1`,
      [id]
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    // rowCount>0, devolvemos el primer registro
    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error en obtenerUsuarioPorId:', err);
    return res.status(500).json({ msg: 'Error interno del servidor' });
  }
}
/**
 * PUT /api/usuarios/:id
 * Actualiza nombre, cedula, ciudad y email
 */
// Registra un nuevo cotizador
const registrarUsuario = async (req, res) => {
  const { usuario, cedula, email, password } = req.body;
  console.log(`📝 Intentando registrar: ${usuario} / ${cedula} / ${email}`);

  try {
    const existe = await db.query(
      'SELECT 1 FROM usuarios WHERE usuario = $1',
      [usuario]
    );
    if (existe.rowCount > 0) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO usuarios 
         (usuario, nombre, cedula, email, password_hash, rol)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [usuario, 'Por definir', cedula, email, hash, 'cotizador']
    );

    return res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('❌ Error en registrarUsuario:', {
      code:   error.code,
      detail: error.detail,
      message:error.message
    });
    // Manejo de duplicados
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Usuario, cédula o email duplicado' });
    }
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
// Login: valida credenciales y devuelve id, usuario, nombre, rol y token
const loginUsuario = async (req, res) => {
  const { usuario, password } = req.body;
  console.log(`🔍 Intentando login: ${usuario}`);
  try {
     // Buscamos al usuario en la base de datos
    const resultado = await db.query(
      'SELECT * FROM usuarios WHERE usuario = $1',
      [usuario]
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const u = resultado.rows[0];
    // Se verifica la contraseña
    const esValido = await bcrypt.compare(password, u.password_hash);
    console.log(`🔐 Contraseña válida: ${esValido}`);
    if (!esValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    //Generamos el JWT
    const token = jwt.sign(
      { id: u.id, rol: u.rol },         // payload
      process.env.JWT_SECRET,           // jwt secreto en .env
      { expiresIn: '2h' }               // caducidad de 2 horas
    );
    // Devuelve el mismo shape que el modelo Flutter espera
    return res.status(200).json({
      id:      u.id,
      usuario: u.usuario,
      nombre:  u.nombre,
      rol:     u.rol,
      token
    });
  } catch (error) {
    console.error('❌ Error en loginUsuario:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};
// Crea el admin la primera vez que se arranca la app
const crearAdmin = async (req, res) => {
  try {
    const usuario = process.env.ADMIN_USER;
    const password = process.env.ADMIN_PASS;

    const { rowCount } = await db.query(
      'SELECT 1 FROM usuarios WHERE rol = $1',
      ['administrador']
    );
    if (rowCount > 0) {
      return res.status(409).json({ mensaje: 'Administrador ya existe' });
    }
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO usuarios
         (usuario, nombre, cedula, password_hash, rol)
       VALUES ($1, $2, $3, $4, $5)`,
      [usuario, 'Administrador', '0000000000', hash, 'administrador']
    );

    return res.status(201).json({ mensaje: 'Administrador creado' });
  } catch (error) {
    console.error('Error crearAdmin:', error);
    return res.status(500).json({ error: 'Error interno al crear admin' });
  }
};
const actualizarUsuario = async (req, res) => {
  console.log('🎯 controlador actualizarUsuario:', req.method, req.originalUrl, 'body=', req.body);

  // 1) Extrae el id de la URL y el id del JWT
  const paramId    = Number(req.params.id);
  const tokenId    = req.user.id;              // viene de validarJWT
  
  // 2) Calcula qué usuario vamos a actualizar
  let targetUserId;
  if (req.user.rol === 'administrador') {
    targetUserId = paramId;                    // el admin puede cambiar a cualquiera
  } else {
    // usuario normal sólo puede cambiar su propio perfil
    if (tokenId !== paramId) {
      return res.status(403).json({ msg: 'No tienes permisos para actualizar este usuario' });
    }
    targetUserId = tokenId;
  }

  // 3) Desestructura los campos permitidos del body
  const { nombre, email, cedula } = req.body;

  try {
    // 4) Ejecuta el UPDATE y devuelve el usuario actualizado
    const result = await db.query(`
      UPDATE usuarios
      SET nombre = $1,
          email  = $2,
          cedula = $3
      WHERE id = $4
      RETURNING id, usuario, nombre, email, cedula, rol;
    `, [nombre, email, cedula, targetUserId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // 5) Responde con el objeto completo
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error actualizando usuario:', err);
    return res.status(500).json({ msg: 'Error interno', error: err.message });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  crearAdmin,
  obtenerUsuarioPorId,
  actualizarUsuario,
};
