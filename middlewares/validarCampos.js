const validarCampos = (campos) => {
  return (req, res, next) => {
    const errores = campos.filter((campo) => !req.body[campo]);
    if (errores.length > 0) {
      return res.status(400).json({ error: `Faltan campos: ${errores.join(', ')}` });
    }
    next();
  };
};
module.exports = validarCampos;
