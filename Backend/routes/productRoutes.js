import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// 🌍 Route PUBLIQUE : Récupérer tous les produits actifs
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ createdAt: -1 }) 
      .populate('vendeur', 'name');
      
    res.json(products);
  } catch (error) {
    console.error("Erreur récupération produits publics:", error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;