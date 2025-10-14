const { Router } = require('express');
const validarJWT = require('../middlewares/validarJWT');
const { body } = require('express-validator');
const validarCampos = require('../middlewares/validarCampos');
const {
  registrarUsuario,
  loginUsuario,
  crearAdmin,
  obtenerUsuarioPorId,
  actualizarUsuario
} = require('../controllers/usuariosController');
const router = Router();

// POST /api/usuarios/registro
router.post(
  '/registro',
  validarCampos(['usuario', 'cedula', 'email', 'password']),
  registrarUsuario
);

// POST /api/usuarios/login
router.post(
  '/login',
  validarCampos(['usuario', 'password']),
  loginUsuario
);

// POST /api/usuarios/crear-admin
router.post('/crear-admin', validarJWT, validarCampos, crearAdmin);

// GET /api/usuarios/test
router.get('/test', (req, res) => {
  res.json({
    status: 'conectado',
    mensaje: '✅ Backend funcionando desde navegador',
    fecha: new Date().toISOString()
  });
});

// GET /api/usuarios/:id → trae perfil (requiere JWT)
router.get(
  '/:id',
  validarJWT,
  obtenerUsuarioPorId
);
// PUT /api/usuarios/:id → actualiza perfil (requiere JWT)
router.put('/:id', validarJWT, actualizarUsuario);

module.exports = router;
