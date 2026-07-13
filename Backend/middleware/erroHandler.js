// ============================================
// CLASSE D'ERREUR PERSONNALISÉE
// ============================================
export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================
// GESTIONNAIRE D'ERREURS GLOBAL
// ============================================
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Logger l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erreur :', err);
  }

  // ============================================
  // ERREURS MOONGOOSE
  // ============================================

  // Erreur de cast (ID invalide)
  if (err.name === 'CastError') {
    const message = `Ressource non trouvée avec l'ID ${err.value}`;
    error = new ApiError(404, message);
  }

  // Erreur de clé dupliquée
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Cette valeur existe déjà pour le champ : ${field}`;
    error = new ApiError(400, message);
  }

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    const message = 'Erreur de validation';
    error = new ApiError(400, message, errors);
  }

  // ============================================
  // ERREURS JWT
  // ============================================
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = new ApiError(401, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = new ApiError(401, message);
  }

  // ============================================
  // ERREURS MULTER (UPLOAD)
  // ============================================
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Fichier trop volumineux (max 5MB)';
    error = new ApiError(400, message);
  }

  // ============================================
  // RÉPONSE
  // ============================================
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur serveur',
    errors: error.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// ============================================
// ASYNC HANDLER (POUR ÉVITER LES TRY/CATCH)
// ============================================
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};