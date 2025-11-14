const jwt = require("jsonwebtoken");
function validarJWT(o, r, e) {
    console.log("🔔 Middleware validarJWT disparado para:", o.method, o.originalUrl);
    const n = o.headers.authorization;
    if (!n?.startsWith("Bearer ")) return r.status(401).json({ msg: "No token proporcionado" });
    const s = n.split(" ")[1];
    console.log("🔍 Token recibido en validarJWT:", s);
    try {
        const r = jwt.verify(s, process.env.JWT_SECRET);
        return (o.user = r), console.log("✅ JWT válido para UID:", r), e();
    } catch (o) {
        return console.error("🚫 JWT inválido:", o), r.status(401).json({ msg: "Token inválido" });
    }
}
module.exports = validarJWT;
