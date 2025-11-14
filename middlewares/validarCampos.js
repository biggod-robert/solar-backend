const validarCampos = (campos) => (req, res, next) => {
  const faltantes = campos.filter((campo) => !req.body[campo]);
  if (faltantes.length > 0) {
    return res.status(400).json({ error: `Faltan campos: ${faltantes.join(", ")}` });
  }
  next();
};

module.exports = validarCampos;
