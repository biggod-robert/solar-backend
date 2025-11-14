const validarCampos = (o) => (a, r, s) => {
    const t = o.filter((o) => !a.body[o]);
    if (t.length > 0) return r.status(400).json({ error: `Faltan campos: ${t.join(", ")}` });
    s();
};
module.exports = validarCampos;
