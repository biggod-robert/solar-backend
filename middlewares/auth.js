const validarJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || token !== "tu_token_de_prueba") {
    return res.status(401).json({ error: "Token inválido o faltante" });
  }
  req.usuario = { rol: "administrador" };
  next();
};

const esAdminRole = (req, res, next) => {
  if (req.usuario?.rol !== "administrador") {
    return res.status(403).json({ error: "Acceso solo para administrador" });
  }
  next();
};

module.exports = { validarJWT, esAdminRole };
