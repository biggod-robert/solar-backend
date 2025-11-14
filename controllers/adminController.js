const db = require("../db");

const obtenerEstadisticas = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT ciudad, COUNT(*) AS total FROM cotizaciones GROUP BY ciudad"
    );
    res.json({ estadisticas: result.rows });
  } catch (err) {
    console.error("❌ Error al obtener estadísticas:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { obtenerEstadisticas };
