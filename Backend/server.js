import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/database.js';
import apiRoutes from './routes/index.js';

// Configuration des variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Initialisation de l'application Express
const app = express();

// Récupération du __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// CORS - Autoriser les requêtes depuis le frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger les requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir les fichiers uploadés statiquement
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// ROUTES API
// ============================================
app.use('/api', apiRoutes);

// ============================================
// ROUTES DE TEST
// ============================================

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🛍️ Bienvenue sur l\'API Sourang Market',
    version: '1.0.0',
    status: 'En ligne',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      vendors: '/api/vendors',
      orders: '/api/orders',
      categories: '/api/categories'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// GESTIONNAIRE D'ERREURS GLOBAL
// ============================================

// Gestionnaire 404 - Route non trouvée
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée : ${req.originalUrl}`
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error(`❌ Erreur : ${err.message}`);
  console.error(err.stack);

  // Erreur Mongoose - CastError (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Erreur Mongoose - Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Cette valeur existe déjà pour le champ : ${field}`,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Erreur Mongoose - Validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errors,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║                                               ║');
  console.log('║   🛍️  SOURANG MARKET API                      ║');
  console.log('║   🚀  Serveur démarré avec succès             ║');
  console.log(`║   📍  http://localhost:${PORT}                  ║`);
  console.log(`║   🌍  Mode : ${process.env.NODE_ENV || 'development'}                    ║`);
  console.log('║                                               ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error(`❌ Erreur non gérée : ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;