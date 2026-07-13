import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// ============================================
// VÉRIFIER SI L'UTILISATEUR EST AUTHENTIFIÉ
// ============================================
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Vérifier le header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Récupérer le token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sourang_market_secret_key_2026');

      // Récupérer l'utilisateur sans le mot de passe
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Utilisateur non trouvé');
      }

      if (!req.user.isActive) {
        res.status(401);
        throw new Error('Compte désactivé');
      }

      next();
    } catch (error) {
      console.error('Erreur d\'authentification :', error.message);
      res.status(401);
      throw new Error('Token invalide ou expiré');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Non autorisé - Token manquant');
  }
});

// ============================================
// VÉRIFIER LES RÔLES
// ============================================
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`);
    }
    next();
  };
};

// ============================================
// RACCOURCIS POUR LES RÔLES
// ============================================
export const isAdmin = authorize('admin');
export const isVendor = authorize('vendeur', 'admin');
export const isClient = authorize('client', 'admin');