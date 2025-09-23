const express = require('express');
const router = express.Router();
const { obtenerEstadisticas } = require('../controllers/adminController');
const { validarJWT, esAdminRole } = require('../middlewares/auth');

router.get('/estadisticas', [validarJWT, esAdminRole], obtenerEstadisticas);

module.exports = router;
