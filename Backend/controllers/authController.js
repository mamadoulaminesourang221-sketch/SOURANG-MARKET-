import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

// ============================================
// INSCRIPTION
// ============================================
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  // Vérifier si l'email existe déjà
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    res.status(400);
    throw new Error('Cet email est déjà utilisé');
  }

  // Vérifier si le téléphone existe déjà
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    res.status(400);
    throw new Error('Ce numéro de téléphone est déjà utilisé');
  }

  // Créer l'utilisateur
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role || 'client'
  });

  // Générer les tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Sauvegarder le refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Mettre à jour la date de dernière connexion
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    message: 'Inscription réussie',
    data: {
      user,
      token,
      refreshToken
    }
  });
});

// ============================================
// CONNEXION
// ============================================
export const login = asyncHandler(async (req, res) => {
  const { login, password } = req.body;

  // Trouver l'utilisateur par email ou téléphone
  const user = await User.findOne({
    $or: [
      { email: login },
      { phone: login }
    ]
  }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Identifiants invalides');
  }

  // Vérifier si le compte est actif
  if (!user.isActive) {
    res.status(401);
    throw new Error('Votre compte a été désactivé');
  }

  // Vérifier le mot de passe
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Identifiants invalides');
  }

  // Générer les tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Sauvegarder le refresh token
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Connexion réussie',
    data: {
      user,
      token,
      refreshToken
    }
  });
});

// ============================================
// DÉCONNEXION
// ============================================
export const logout = asyncHandler(async (req, res) => {
  // Supprimer le refresh token
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      refreshToken: null
    });
  }

  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// ============================================
// OBTENIR LE PROFIL
// ============================================
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: user
  });
});

// ============================================
// METTRE À JOUR LE PROFIL
// ============================================
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  // Vérifier si le téléphone est déjà utilisé par un autre utilisateur
  if (phone && phone !== req.user.phone) {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      res.status(400);
      throw new Error('Ce numéro de téléphone est déjà utilisé');
    }
  }

  // Mettre à jour l'utilisateur
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profil mis à jour',
    data: user
  });
});

// ============================================
// CHANGER LE MOT DE PASSE
// ============================================
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Récupérer l'utilisateur avec le mot de passe
  const user = await User.findById(req.user._id).select('+password');

  // Vérifier le mot de passe actuel
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Mot de passe actuel incorrect');
  }

  // Mettre à jour le mot de passe
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Mot de passe modifié avec succès'
  });
});

// ============================================
// VALIDATEURS
// ============================================
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est obligatoire')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Le téléphone est obligatoire')
    .matches(/^(\+221)?[37][05678]\d{7}$/).withMessage('Numéro de téléphone sénégalais invalide'),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  
  body('role')
    .optional()
    .isIn(['client', 'vendeur']).withMessage('Rôle invalide'),
  
  validate
];

export const loginValidator = [
  body('login')
    .trim()
    .notEmpty().withMessage('L\'email ou le téléphone est obligatoire'),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire'),
  
  validate
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+221)?[37][05678]\d{7}$/).withMessage('Numéro de téléphone sénégalais invalide'),
  
  validate
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Le mot de passe actuel est obligatoire'),
  
  body('newPassword')
    .notEmpty().withMessage('Le nouveau mot de passe est obligatoire')
    .isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
  
  validate
];