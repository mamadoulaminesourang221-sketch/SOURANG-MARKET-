import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  // ============================================
  // PROPRIÉTAIRE (LIEN VERS USER)
  // ============================================
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est obligatoire'],
    unique: true
  },

  // ============================================
  // INFORMATIONS DE LA BOUTIQUE
  // ============================================
  shopName: {
    type: String,
    required: [true, 'Le nom de la boutique est obligatoire'],
    unique: true,
    trim: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },

  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  description: {
    type: String,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },

  // ============================================
  // LOGO & BANNIÈRE
  // ============================================
  logo: {
    type: String,
    default: ''
  },

  banner: {
    type: String,
    default: ''
  },

  // ============================================
  // CONTACT & ADRESSE
  // ============================================
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },

  contactPhone: {
    type: String,
    trim: true
  },

  address: {
    street: String,
    city: {
      type: String,
      default: 'Dakar'
    },
    region: String,
    country: {
      type: String,
      default: 'Sénégal'
    }
  },

  // ============================================
  // RÉSEAUX SOCIAUX
  // ============================================
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    whatsapp: String,
    website: String
  },

  // ============================================
  // STATUT & APPROBATION
  // ============================================
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'suspended', 'rejected'],
      message: 'Statut invalide'
    },
    default: 'pending'
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  // ============================================
  // COMMISSION
  // ============================================
  commissionRate: {
    type: Number,
    default: 10,
    min: [0, 'Le taux de commission ne peut pas être négatif'],
    max: [100, 'Le taux de commission ne peut pas dépasser 100%']
  },

  // ============================================
  // PAIEMENTS VENDEUR
  // ============================================
  paymentInfo: {
    method: {
      type: String,
      enum: ['wave', 'orange_money', 'bank_transfer'],
      default: 'wave'
    },
    phoneNumber: String,
    bankName: String,
    accountNumber: String,
    accountName: String
  },

  // ============================================
  // STATISTIQUES
  // ============================================
  stats: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },

  // ============================================
  // SOLDE & REVENUS
  // ============================================
  balance: {
    available: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },

  // ============================================
  // CATÉGORIES DE PRODUITS
  // ============================================
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],

  // ============================================
  // POLITIQUES
  // ============================================
  policies: {
    returnPolicy: {
      type: String,
      maxlength: [500, 'La politique de retour ne peut pas dépasser 500 caractères']
    },
    shippingPolicy: {
      type: String,
      maxlength: [500, 'La politique de livraison ne peut pas dépasser 500 caractères']
    },
    deliveryTime: {
      type: String,
      default: '2-5 jours'
    }
  },

  // ============================================
  // APPROBATION & MODÉRATION
  // ============================================
  approvalNote: {
    type: String,
    maxlength: [500, 'La note ne peut pas dépasser 500 caractères']
  },

  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  suspendedAt: Date,
  suspensionReason: String,

  // ============================================
  // MÉTADONNÉES
  // ============================================
  lastActiveAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEX POUR OPTIMISATION
// ============================================
vendorSchema.index({ shopName: 'text', description: 'text' });
vendorSchema.index({ slug: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ 'stats.totalSales': -1 });
vendorSchema.index({ 'stats.averageRating': -1 });
vendorSchema.index({ createdAt: -1 });

// ============================================
// VIRTUALS
// ============================================

vendorSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

vendorSchema.virtual('isSuspended').get(function() {
  return this.status === 'suspended';
});

vendorSchema.virtual('netRevenue').get(function() {
  return this.stats.totalRevenue - (this.stats.totalRevenue * this.commissionRate / 100);
});

// ============================================
// HOOKS (MIDDLEWARES MONGOOSE)
// ============================================

// Générer le slug automatiquement
vendorSchema.pre('save', function(next) {
  if (this.isModified('shopName') && !this.slug) {
    this.slug = this.shopName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      + '-' + Date.now().toString(36);
  }
  next();
});

// Mettre à jour le rôle de l'utilisateur quand le vendeur est approuvé
vendorSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'approved') {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.user, { role: 'vendeur' });
  }
  next();
});

// ============================================
// MÉTHODES D'INSTANCE
// ============================================

// Approuver le vendeur
vendorSchema.methods.approve = async function(adminId, note = '') {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  this.approvalNote = note;

  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.user, { role: 'vendeur' });

  await this.save();
  return this;
};

// Suspendre le vendeur
vendorSchema.methods.suspend = async function(reason) {
  this.status = 'suspended';
  this.suspendedAt = new Date();
  this.suspensionReason = reason;
  await this.save();
  return this;
};

// Mettre à jour les statistiques
vendorSchema.methods.updateStats = async function() {
  const Product = mongoose.model('Product');
  const Order = mongoose.model('Order');

  const [productCount, orderStats] = await Promise.all([
    Product.countDocuments({ vendor: this._id, status: 'actif' }),
    Order.aggregate([
      { $match: { 'items.vendor': this._id, orderStatus: 'delivered' } },
      { $unwind: '$items' },
      { $match: { 'items.vendor': this._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      }
    ])
  ]);

  this.stats.totalProducts = productCount;
  if (orderStats.length > 0) {
    this.stats.totalOrders = orderStats[0].totalOrders;
    this.stats.totalSales = orderStats[0].totalSales;
    this.stats.totalRevenue = orderStats[0].totalRevenue;
  }

  await this.save();
  return this;
};

// Ajouter des fonds au solde
vendorSchema.methods.addToBalance = async function(amount) {
  this.balance.available += amount;
  this.balance.total += amount;
  await this.save();
  return this;
};

// Retirer des fonds du solde
vendorSchema.methods.withdrawFromBalance = async function(amount) {
  if (this.balance.available < amount) {
    throw new Error('Solde insuffisant');
  }
  this.balance.available -= amount;
  await this.save();
  return this;
};

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Top vendeurs
vendorSchema.statics.getTopVendors = async function(limit = 10) {
  return await this.find({ status: 'approved' })
    .populate('user', 'name email avatar')
    .sort({ 'stats.totalRevenue': -1 })
    .limit(limit);
};

// Vendeurs en attente d'approbation
vendorSchema.statics.getPendingVendors = async function(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [vendors, total] = await Promise.all([
    this.find({ status: 'pending' })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments({ status: 'pending' })
  ]);

  return {
    vendors,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Statistiques globales des vendeurs
vendorSchema.statics.getVendorsStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
        approvedVendors: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        pendingVendors: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        suspendedVendors: {
          $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
        },
        totalRevenue: { $sum: '$stats.totalRevenue' },
        totalProducts: { $sum: '$stats.totalProducts' },
        totalSales: { $sum: '$stats.totalSales' }
      }
    }
  ]);

  return stats[0] || {
    totalVendors: 0,
    approvedVendors: 0,
    pendingVendors: 0,
    suspendedVendors: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalSales: 0
  };
};

// ============================================
// MODÈLE
// ============================================

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;