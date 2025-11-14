const express = require("express"),
    router = express.Router(),
    { obtenerEstadisticas: obtenerEstadisticas } = require("../controllers/adminController"),
    { validarJWT: validarJWT, esAdminRole: esAdminRole } = require("../middlewares/auth");
router.get("/estadisticas", [validarJWT, esAdminRole], obtenerEstadisticas), (module.exports = router);
