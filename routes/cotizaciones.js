const { Router } = require('express');
const { body }       = require('express-validator');
const validarCampos  = require('../middlewares/validarCampos');
const validarJWT     = require('../middlewares/validarJWT');

const {
  registrarCotizacion,
  obtenerCotizaciones,
  obtenerEstadisticas,
  actualizarCotizacion
} = require('../controllers/cotizacionesController');
const router = Router();

// GET público: lista / filtrado
router.get('/', obtenerCotizaciones);
router.get('/todas', obtenerCotizaciones);
router.get(
  '/estadisticas', 
  validarJWT,
  obtenerEstadisticas
);


// POST público: registrar cotización
router.post(
  '/registrar',
  validarJWT,
  validarCampos([
    'nombre',
    'cedula',
    'ciudad',
    'panel',
    'totalCotizado'
  ]),
  registrarCotizacion
);

// PUT protegido: actualizar cotización
router.put(
  '/:id',
  validarJWT,                                 // ← pasa por validarJWT y next()
  // valida solo los campos opcionales que quieras permitir
  body('nombre').optional().notEmpty().withMessage('nombre no puede quedar vacío'),
  body('cedula').optional().notEmpty().withMessage('cédula no puede quedar vacía'),
  body('ciudad').optional().notEmpty().withMessage('ciudad no puede quedar vacía'),
  body('panel').optional().notEmpty().withMessage('panel no puede quedar vacío'),
  body('totalCotizado').optional().isNumeric().withMessage('totalCotizado debe ser numérico'),
  validarCampos,                              // recoge errores de express-validator
  actualizarCotizacion                        // responde con 200 + JSON
);

module.exports = router;