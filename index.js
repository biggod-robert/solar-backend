// 1️⃣ se carga .env únicamente si no existe DATABASE_URL y estamos en DEV
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.development' });
}
console.log({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL
});
// 2️⃣ Ahora ya puedes usar process.env
const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios');
const cotizacionesRoutes = require('./routes/cotizaciones');
const adminRoutes = require('./routes/admin');
const db = require('./db');
const bcrypt = require('bcrypt');
const seedAdmin = require('./seeds/createAdmin');
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (_req, res) => res.send('Solar backend operativo'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`☀️ Servidor solar encendido en puerto ${PORT}`)
);
seedAdmin()
  .catch(err => console.error('❌ Error al crear admin seed:', err));
module.exports = app;
