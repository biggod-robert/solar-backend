const db = require('../db');

const registrarCotizacion = async (req, res) => {
  // 1) Desestructura TODOS los campos que esperas del body
  const {
    nombre, cedula,
    consumo, ciudad, panel,
    tipoTecho, tipoFase,
    piso, potenciaKw,
    cantidadPaneles, area,
    totalCotizado
  } = req.body;

  // 2) Toma el ID numérico del usuario autenticado
  const userId = req.user.id;

  try {
    // 3) Inserta usando siempre userId como entero
    const result = await db.query(`
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
    `, [
      userId,
      nombre, cedula,
      consumo, ciudad, panel,
      tipoTecho, tipoFase ?? 'Trifásico',
      piso    ?? 'Primer piso',
      potenciaKw      ?? 0,
      cantidadPaneles ?? 0,
      area            ?? 0,
      totalCotizado
    ]);

    // 4) Devuelve el registro recién creado
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al registrar cotización:', err);
    return res.status(500).json({ error: 'Error interno', details: err.message });
  }
};

const obtenerCotizaciones = async (req, res) => {
  const { ciudad, fecha } = req.query;
  let query = 'SELECT * FROM cotizaciones';
  const valores = [];

  if (ciudad || fecha) {
    query += ' WHERE';
    if (ciudad) {
      valores.push(ciudad);
      query += ` ciudad = $${valores.length}`;
    }
    if (fecha) {
      if (ciudad) query += ' AND';
      valores.push(fecha);
      query += ` fecha::date = $${valores.length}`;
    }
  }

  query += ' ORDER BY fecha DESC';

  try {
    const resultado = await db.query(query, valores);
    res.json(resultado.rows);
  } catch (err) {
    console.error('❌ Error al obtener cotizaciones:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
const obtenerEstadisticas = async (req, res) => {
  try {
    const porCiudad = await db.query(`
      SELECT ciudad, COALESCE(COUNT(*), 0) AS total
      FROM cotizaciones
      GROUP BY ciudad
    `);

    const porFecha = await db.query(`
      SELECT TO_CHAR(fecha::date, 'YYYY-MM-DD') AS fecha, COUNT(*) AS total
      FROM cotizaciones
      WHERE fecha >= NOW() - INTERVAL '7 days'
      GROUP BY fecha::date
      ORDER BY fecha::date;
    `);

    const panelesPopulares = await db.query(`
      SELECT panel, COALESCE(COUNT(*), 0) AS count
      FROM cotizaciones
      GROUP BY panel
      ORDER BY count DESC
      LIMIT 5;
    `);

    const usuariosActivos = await db.query(`
      SELECT u.usuario AS usuario,
             COALESCE(COUNT(c.id), 0) AS count
      FROM cotizaciones c
      JOIN usuarios u
        ON u.id = c.usuario
      GROUP BY u.usuario
      ORDER BY count DESC
      LIMIT 5;
    `);

    // 🔧 Limpieza final para asegurar que ningún campo sea null
    const limpiar = (lista, campo) =>
      lista.rows.map(e => ({
        ...e,
        [campo]: Number(e[campo] ?? 0),
      }));
      
    console.log('📊 Estadísticas generadas:', {
      porCiudad: limpiar(porCiudad, 'total'),
      porFecha: limpiar(porFecha, 'total'),
      panelesPopulares: limpiar(panelesPopulares, 'count'),
      usuariosMasActivos: limpiar(usuariosActivos, 'count'),
    });
    return res.status(200).json({
      porCiudad: limpiar(porCiudad, 'total'),
      porFecha: limpiar(porFecha, 'total'),
      panelesPopulares: limpiar(panelesPopulares, 'count'),
      usuariosMasActivos: limpiar(usuariosActivos, 'count'),
    });
  } catch (err) {
    console.error('❌ Error en estadísticas:', err);
    return res.status(500).json({ error: 'Error al obtener estadísticas', detalle: err.message });
  }
};
const actualizarCotizacion = async (req, res) => {
  const { id } = req.params;
  const cambios = req.body;

  console.log(`🔄 PUT /api/cotizaciones/${id}`, cambios);

  try {
    // Ajusta el SET según los campos que permitas actualizar
    const fields  = [];
    const values  = [];
    let idx       = 1;

    for (const key of ['usuario','nombre','cedula','ciudad','panel','totalCotizado']) {
      if (cambios[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(cambios[key]);
        idx++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ msg: 'Nada que actualizar' });
    }

    // Arma la consulta dinámica
    const query = `
      UPDATE cotizaciones
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;
    values.push(id);

    const resultado = await db.query(query, values);
    const actualizada = resultado.rows[0];

    return res.status(200).json({
      ok: true,
      msg: 'Cotización actualizada',
      cotizacion: actualizada
    });
  } catch (err) {
    console.error('❌ Error al actualizar cotización:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};
module.exports = {
  registrarCotizacion,
  obtenerCotizaciones,
  obtenerEstadisticas,
  actualizarCotizacion
};