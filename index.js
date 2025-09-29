require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios');
const cotizacionesRoutes = require('./routes/cotizaciones');
const adminRoutes = require('./routes/admin');
const db = require('./db');
const bcrypt = require('bcrypt');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// 🔐 Rutas agrupadas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);
app.use('/api/admin', adminRoutes);

// 🧪 Prueba rápida
app.get('/', (_, res) => {
  console.log('✅ Conexión web recibida en /');
  res.send('Solar backend operativo');
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`☀️ Servidor solar encendido en puerto ${PORT}`);
});

module.exports = app;
