require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');

// Importar modelos para que Sequelize los registre antes de sync
require('./models/usuario');
require('./models/npc');
require('./models/grupo');
require('./models/grupoUsuario');
require('./models/grupoFicha');
require('./models/combateSave');
require('./models/monstruoCache');

const npcRoutes      = require('./routes/npcRoutes');
const externalRoutes = require('./routes/externalRoutes');
const authRoutes     = require('./routes/authRoutes');
const grupoRoutes    = require('./routes/grupoRoutes');
const combateRoutes  = require('./routes/combateRoutes');
const perfilRoutes   = require('./routes/perfil');
const errorHandler        = require('./middleware/errorHandler');
const { inicializarCache } = require('./services/cacheMonstruos');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  inicializarCache().catch((err) => console.error('[Cache] Error al inicializar:', err));
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://192.168.1.36:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API de fichas de PNJ - D&D' });
});

app.use('/api/auth',     authRoutes);
app.use('/api/npcs',     npcRoutes);
app.use('/api/grupos',   grupoRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/combates', combateRoutes);
app.use('/api/perfil',   perfilRoutes);
app.use('/avatars', express.static(path.join(__dirname, '../public/avatars')));

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
