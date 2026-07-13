import { validationResult } from 'express-validator';

// ============================================
// VALIDER LES RÉSULTATS DE EXPRESS-VALIDATOR
// ============================================
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errorMessages
    });
  }

  next();
};

// ============================================
// VALIDATEURS RÉUTILISABLES
// ============================================
export const validators = {
  // Email
  email: (field = 'email') => {
    return {
      field,
      message: 'Email invalide'
    };
  },

  // Téléphone sénégalais
  phone: (field = 'phone') => {
    return {
      field,
      message: 'Numéro de téléphone sénégalais invalide (ex: +221771234567)'
    };
  },

  // Mot de passe
  password: (field = 'password') => {
    return {
      field,
      message: 'Le mot de passe doit contenir au moins 6 caractères'
    };
  }
};