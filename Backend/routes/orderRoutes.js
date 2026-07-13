import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// Middleware pour vérifier si l'utilisateur est Admin ou Vendeur
const isAdminOrVendeur = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendeur') {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  next();
};

// 📋 1. Créer une nouvelle commande (Client)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Votre panier est vide' });
    }

    // Vérification du stock et enrichissement des données
    const enrichedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Produit introuvable` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuffisant pour ${product.nom}` });
      }

      // On ajoute les détails du produit dans la commande (Snapshot)
      enrichedItems.push({
        product: product._id,
        name: product.nom,
        price: product.prix,
        quantity: item.quantity,
        image: product.image
      });

      // Décrémenter le stock immédiatement
      product.stock -= item.quantity;
      await product.save();

      calculatedTotal += product.prix * item.quantity;
    }

    const newOrder = new Order({
      user: req.user.id,
      items: enrichedItems,
      total: calculatedTotal, // On utilise le total calculé côté serveur pour plus de sécurité
      shippingAddress,
      paymentMethod: paymentMethod || 'mobile_money',
      statut: 'en_attente'
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Erreur création commande:", error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// 📋 2. Obtenir mes commandes (Client)
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'nom image prix'); // Populate au cas où
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// 📋 3. Obtenir toutes les commandes (Admin/Vendeur)
router.get('/', authMiddleware, isAdminOrVendeur, async (req, res) => {
  try {
    let query = {};
    
    // Si c'est un vendeur, on filtre pour ne voir que les commandes contenant SES produits
    if (req.user.role === 'vendeur') {
      const myProducts = await Product.find({ vendeur: req.user.id }).select('_id');
      const productIds = myProducts.map(p => p._id);
      
      // On cherche les commandes qui contiennent au moins un de ces produits
      query = { 'items.product': { $in: productIds } };
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

// 📋 4. Mettre à jour le statut d'une commande (Admin/Vendeur)
router.patch('/:id/status', authMiddleware, isAdminOrVendeur, async (req, res) => {
  try {
    const { statut } = req.body; 
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { statut }, 
      { new: true } // Retourne la commande mise à jour
    );
    
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour', error });
  }
});

export default router;