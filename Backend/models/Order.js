import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Référence vers l'utilisateur (client) qui a passé la commande
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

  // Liste des produits commandés
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    name: String, // On stocke le nom au cas où le produit serait supprimé plus tard
    image: String, // Idem pour l'image
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],

  // Adresse de livraison
  shippingAddress: {
    nom: { type: String, required: true },
    telephone: { type: String, required: true },
    adresse: { type: String, required: true },
    ville: { type: String, required: true }
  },

  // Méthode de paiement
  paymentMethod: {
    type: String,
    required: true,
    default: 'mobile_money', // ou 'cash_on_delivery'
    enum: ['mobile_money', 'cash_on_delivery', 'card']
  },

  // Statut de la commande
  statut: {
    type: String,
    required: true,
    default: 'en_attente',
    enum: ['en_attente', 'confirmée', 'expédiée', 'livrée', 'annulée']
  },

  // Montant total de la commande
  total: {
    type: Number,
    required: true,
    default: 0.0
  },

  // Date de livraison estimée ou réelle (optionnel)
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Index pour accélérer les recherches par utilisateur
orderSchema.index({ user: 1 });

export default mongoose.model('Order', orderSchema);