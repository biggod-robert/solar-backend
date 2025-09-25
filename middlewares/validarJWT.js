// middlewares/validar-jwt.js
const jwt = require('jsonwebtoken');

function validarJWT(req, res, next) {
  console.log('🔔 Middleware validarJWT disparado para:', req.method, req.originalUrl);
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔍 Token recibido en validarJWT:', token);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    console.log('✅ JWT válido para UID:', payload);
    return next();
  } catch (err) {
    console.error('🚫 JWT inválido:', err);
    return res.status(401).json({ msg: 'Token inválido' });
  }
}

module.exports = validarJWT;
