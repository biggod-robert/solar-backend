const db = require('../db');

const obtenerEstadisticas = async (req, res) => {
  try {
    const resultado = await db.query(`
      SELECT ciudad, COUNT(*) AS total
      FROM cotizaciones
      GROUP BY ciudad
    `);
    res.json({ estadisticas: resultado.rows });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerEstadisticas,
};
