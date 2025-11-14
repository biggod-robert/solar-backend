// controllers/cotizacionesController.js
const db = require("../db");

const registrarCotizacion = async (req, res) => {
  console.log("📥 Entró a registrarCotizacion con body:", req.body);

  const {
    nombre,
    cedula,
    consumo,
    ciudad,
    panel,
    tipoTecho,
    tipoFase,
    piso,
    potenciaKw,
    cantidadPaneles,
    area,
    totalCotizado,
  } = req.body;
  const usuarioId = req.user.id;

  try {
    const result = await db.query(
      `
      INSERT INTO cotizaciones (
        usuario, nombre, cedula,
        consumo, ciudad, panel,
        tipo_techo, tipo_fase,
        piso, potencia_kw,
        cantidad_paneles, area,
        total_cotizado
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6,
        $7, $8,
        $9, $10,
        $11, $12,
        $13
      )
      RETURNING *;
      `,
      [
        usuarioId,
        nombre,
        cedula,
        consumo,
        ciudad,
        panel,
        tipoTecho,
        tipoFase ?? "Trifásico",
        piso ?? "Primer piso",
        potenciaKw ?? 0,
        cantidadPaneles ?? 0,
        area ?? 0,
        totalCotizado,
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error al registrar cotización:", err);
    return res
      .status(500)
      .json({ error: "Error interno", details: err.message });
  }
};

const obtenerCotizaciones = async (req, res) => {
  console.log("📥 Entró a obtenerCotizaciones con query:", req.query);
  const { ciudad, fecha } = req.query;

  let query = "SELECT * FROM cotizaciones";
  const params = [];

  if (ciudad || fecha) {
    query += " WHERE";
    if (ciudad) {
      params.push(ciudad);
      query += ` ciudad = $${params.length}`;
    }
    if (fecha) {
      if (ciudad) query += " AND";
      params.push(fecha);
      query += ` fecha::date = $${params.length}`;
    }
  }
  query += " ORDER BY fecha DESC";

  try {
    const result = await db.query(query, params);
    console.log("📤 Cotizaciones obtenidas:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener cotizaciones:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const obtenerEstadisticas = async (req, res) => {
  console.log("📥 Entró a obtenerEstadisticas");
  try {
    const porCiudad = await db.query(
      `SELECT ciudad, COALESCE(COUNT(*), 0) AS total
       FROM cotizaciones
       GROUP BY ciudad`
    );

    const porFecha = await db.query(
      `SELECT TO_CHAR(fecha::date, 'YYYY-MM-DD') AS fecha, COUNT(*) AS total
       FROM cotizaciones
       WHERE fecha >= NOW() - INTERVAL '7 days'
       GROUP BY fecha::date
       ORDER BY fecha::date;`
    );

    const panelesPopulares = await db.query(
      `SELECT panel, COALESCE(COUNT(*), 0) AS count
       FROM cotizaciones
       GROUP BY panel
       ORDER BY count DESC
       LIMIT 5;`
    );

    const usuariosMasActivos = await db.query(
      `SELECT u.usuario AS usuario,
              COALESCE(COUNT(c.id), 0) AS count
       FROM cotizaciones c
       JOIN usuarios u ON u.id = c.usuario
       GROUP BY u.usuario
       ORDER BY count DESC
       LIMIT 5;`
    );

    const mapRows = (result, field) =>
      result.rows.map((row) => ({ ...row, [field]: Number(row[field] ?? 0) }));

    console.log("📊 Estadísticas generadas:", {
      porCiudad: mapRows(porCiudad, "total"),
      porFecha: mapRows(porFecha, "total"),
      panelesPopulares: mapRows(panelesPopulares, "count"),
      usuariosMasActivos: mapRows(usuariosMasActivos, "count"),
    });

    res.status(200).json({
      porCiudad: mapRows(porCiudad, "total"),
      porFecha: mapRows(porFecha, "total"),
      panelesPopulares: mapRows(panelesPopulares, "count"),
      usuariosMasActivos: mapRows(usuariosMasActivos, "count"),
    });
  } catch (err) {
    console.error("❌ Error en estadísticas:", err);
    res
      .status(500)
      .json({ error: "Error al obtener estadísticas", detalle: err.message });
  }
};

const actualizarCotizacion = async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  console.log(`🔄 PUT /api/cotizaciones/${id}`, body);

  try {
    const updates = [];
    const values = [];
    let index = 1;

    for (const field of [
      "usuario",
      "nombre",
      "cedula",
      "ciudad",
      "panel",
      "totalCotizado",
    ]) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${index}`);
        values.push(body[field]);
        index++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ msg: "Nada que actualizar" });
    }

    const query = `
      UPDATE cotizaciones
      SET ${updates.join(", ")}
      WHERE id = $${index}
      RETURNING *;
    `;
    values.push(id);

    const result = await db.query(query, values);
    const updated = result.rows[0];

    res
      .status(200)
      .json({ ok: true, msg: "Cotización actualizada", cotizacion: updated });
  } catch (err) {
    console.error("❌ Error al actualizar cotización:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = {
  registrarCotizacion,
  obtenerCotizaciones,
  obtenerEstadisticas,
  actualizarCotizacion,
};
