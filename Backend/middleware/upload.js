import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURATION DU STOCKAGE
// ============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = '../uploads/';

    // Déterminer le dossier selon le type de fichier
    if (file.fieldname === 'avatar') {
      uploadPath += 'users/';
    } else if (file.fieldname === 'images') {
      uploadPath += 'products/';
    } else if (file.fieldname === 'logo' || file.fieldname === 'banner') {
      uploadPath += 'vendors/';
    } else {
      uploadPath += 'general/';
    }

    cb(null, path.join(__dirname, uploadPath));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ============================================
// FILTRE DE FICHIERS
// ============================================
const fileFilter = (req, file, cb) => {
  // Types de fichiers autorisés
  const allowedTypes = /jpeg|jpg|png|gif|webp/;

  // Vérifier l'extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  // Vérifier le mimetype
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
  }
};

// ============================================
// CONFIGURATION MULTER
// ============================================
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: fileFilter
});

// ============================================
// MIDDLEWARES D'UPLOAD SPÉCIFIQUES
// ============================================

// Upload avatar utilisateur
export const uploadAvatar = upload.single('avatar');

// Upload images produits (multiple)
export const uploadProductImages = upload.array('images', 10); // Max 10 images

// Upload logo et banner vendeur
export const uploadVendorImages = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// Upload image unique
export const uploadSingle = (fieldName) => upload.single(fieldName);