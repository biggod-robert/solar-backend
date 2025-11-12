const express = require("express");
const { body } = require("express-validator");
const validarCampos = require("../middlewares/validarCampos");
const validarJWT = require("../middlewares/validarJWT");
const {
  registrarCotizacion,
  obtenerCotizaciones,
  obtenerEstadisticas,
  actualizarCotizacion,
} = require("../controllers/cotizacionesController");

const router = express.Router();

router.get("/", obtenerCotizaciones);
router.get("/todas", obtenerCotizaciones);
router.get("/estadisticas", validarJWT, obtenerEstadisticas);
router.post(
  "/registrar",
  validarJWT,
  validarCampos(["nombre", "cedula", "ciudad", "panel", "totalCotizado"]),
  registrarCotizacion
);
router.put(
  "/:id",
  validarJWT,
  body("nombre").optional().notEmpty().withMessage("nombre no puede quedar vacío"),
  body("cedula").optional().notEmpty().withMessage("cédula no puede quedar vacía"),
  body("ciudad").optional().notEmpty().withMessage("ciudad no puede quedar vacía"),
  body("panel").optional().notEmpty().withMessage("panel no puede quedar vacío"),
  body("totalCotizado").optional().isNumeric().withMessage("totalCotizado debe ser numérico"),
  validarCampos,
  actualizarCotizacion
);

module.exports = router;
