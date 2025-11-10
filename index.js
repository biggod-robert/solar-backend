// carga dotenv solo en desarrollo
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: ".env.development" });
}

console.log({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: !!process.env.DATABASE_URL ? "[SET]" : "[NOT SET]"
});

const express = require("express");
const cors = require("cors");
const usuariosRoutes = require("./routes/usuarios");
const cotizacionesRoutes = require("./routes/cotizaciones");
const adminRoutes = require("./routes/admin");
const db = require("./db");
const bcrypt = require("bcrypt");
const seedAdmin = require("./seeds/createAdmin");
const app = express();

app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/cotizaciones", cotizacionesRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => res.send("Solar backend operativo"));

app.get("/health", (req, res) => res.status(200).json({ ok: true, time: new Date().toISOString() }));

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  const HOST = "0.0.0.0";
  app.listen(PORT, HOST, () => {
    console.log(`☀️ Servidor solar encendido en ${HOST}:${PORT}`);
  });
}

// Ejecutar seed de admin pero no bloquear arranque
seedAdmin()
  .then(() => console.log("✅ Seed admin ejecutado"))
  .catch((e) => console.error("❌ Error al crear admin seed:", e));

// debug temporal: listar rutas registradas
app.get("/api/debug-routes", (req, res) => {
  try {
    const routes = [];
    if (app._router && app._router.stack) {
      app._router.stack.forEach((mw) => {
        if (mw.route && mw.route.path) {
          const methods = Object.keys(mw.route.methods).join(",");
          routes.push(`${methods} ${mw.route.path}`);
        } else if (mw.name === "router" && mw.handle && mw.handle.stack) {
          mw.handle.stack.forEach((r) => {
            if (r.route && r.route.path) {
              const methods = Object.keys(r.route.methods).join(",");
              // prefijo del router no es accesible desde aquí; lo listamos tal cual
              routes.push(`${methods} ${r.route.path}`);
            }
          });
        }
      });
    }
    res.json({ ok: true, routes });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e) });
  }
});


module.exports = app;
