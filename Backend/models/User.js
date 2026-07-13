import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  // ============================================
  // INFORMATIONS PERSONNELLES
  // ============================================
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },

  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },

  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est obligatoire'],
    unique: true,
    trim: true,
    match: [/^(\+221)?[37][05678]\d{7}$/, 'Numéro de téléphone sénégalais invalide']
  },

  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas renvoyer par défaut dans les requêtes
  },

  // ============================================
  // RÔLE & STATUT
  // ============================================
  role: {
    type: String,
    enum: {
      values: ['client', 'vendeur', 'admin'],
      message: 'Rôle invalide. Doit être : client, vendeur ou admin'
    },
    default: 'client'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  // ============================================
  // PROFIL
  // ============================================
  avatar: {
    type: String,
    default: ''
  },

  address: {
    street: String,
    city: {
      type: String,
      default: 'Dakar'
    },
    region: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Sénégal'
    }
  },

  // ============================================
  // SÉCURITÉ
  // ============================================
  passwordResetToken: String,
  passwordResetExpires: Date,

  lastLogin: {
    type: Date
  },

  // ============================================
  // MÉTADONNÉES
  // ============================================
  refreshToken: {
    type: String
  }

}, {
  timestamps: true, // Ajoute createdAt et updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEX POUR OPTIMISATION
// ============================================
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ============================================
// VIRTUALS
// ============================================
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// ============================================
// HOOKS (MIDDLEWARES MONGOOSE)
// ============================================

// Hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// MÉTHODES D'INSTANCE
// ============================================

// Vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Générer un JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      email: this.email 
    },
    process.env.JWT_SECRET || 'sourang_market_secret_key_2026',
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

// Générer un refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || 'sourang_market_refresh_secret_2026',
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' 
    }
  );
};

// Convertir en JSON (sans le mot de passe)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Trouver un utilisateur par email ou téléphone
userSchema.statics.findByLogin = async function(login) {
  return await this.findOne({
    $or: [
      { email: login },
      { phone: login }
    ]
  });
};

// Compter les utilisateurs par rôle
userSchema.statics.countByRole = async function(role) {
  return await this.countDocuments({ role, isActive: true });
};

// ============================================
// MODÈLE
// ============================================

const User = mongoose.model('User', userSchema);

export default User;