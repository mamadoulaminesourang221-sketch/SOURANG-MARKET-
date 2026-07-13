import express from 'express';
import multer from 'multer';
import path from 'path';
import authMiddleware from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';

const router = express.Router();

// Configuration de Multer pour stocker les images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Assurez-vous que ce dossier existe à la racine du Backend
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ➕ Route d'ajout de produit (mise à jour)
router.post('/produits', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { nom, prix, description, stock, categorie } = req.body;
    
    const nouveauProduit = new Product({
      nom,
      prix,
      description,
      stock,
      categorie,
      vendeur: req.user.id,
      image: req.file ? `/uploads/${req.file.filename}` : null // Chemin de l'image
    });

    await nouveauProduit.save();
    res.status(201).json(nouveauProduit);
  } catch (error) {
    res.status(500).json({ message: 'Erreur création', error });
  }
});

// ... (gardez les autres routes get/stats, get/produits, etc.)

export default router;

// 📦 Récupérer un produit par son ID
router.get('/produits/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendeur', 'name email');
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});