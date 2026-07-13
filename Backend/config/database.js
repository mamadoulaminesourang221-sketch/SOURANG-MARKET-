import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sourang-market';
    
    console.log('🔄 Connexion à MongoDB en cours...');
    
    const conn = await mongoose.connect(MONGO_URI, {
      // Options dépréciées mais utiles pour la compatibilité
      // mongoose 8 les gère automatiquement
    });

    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║   ✅  MongoDB connecté avec succès            ║');
    console.log(`║   📦  Base : ${conn.connection.name}                          ║`);
    console.log(`║   🌐  Hôte : ${conn.connection.host}                          ║`);
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');

    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error(`❌ Erreur MongoDB : ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB déconnecté');
    });

    // Déconnexion propre à l'arrêt du serveur
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Connexion MongoDB fermée (arrêt du serveur)');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;