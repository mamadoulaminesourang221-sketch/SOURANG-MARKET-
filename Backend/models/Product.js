import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // ============================================
  // INFORMATIONS GÉNÉRALES
  // ============================================
  name: {
    type: String,
    required: [true, 'Le nom du produit est obligatoire'],
    trim: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },

  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    minlength: [10, 'La description doit contenir au moins 10 caractères'],
    maxlength: [5000, 'La description ne peut pas dépasser 5000 caractères']
  },

  shortDescription: {
    type: String,
    maxlength: [300, 'La description courte ne peut pas dépasser 300 caractères']
  },

  // ============================================
  // PRIX & STOCK
  // ============================================
  price: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: [0, 'Le prix ne peut pas être négatif']
  },

  comparePrice: {
    type: Number,
    min: [0, 'Le prix de comparaison ne peut pas être négatif'],
    validate: {
      validator: function(value) {
        // comparePrice doit être supérieur ou égal à price
        return !value || value >= this.price;
      },
      message: 'Le prix de comparaison doit être supérieur au prix actuel'
    }
  },

  costPrice: {
    type: Number,
    min: [0, 'Le prix coûtant ne peut pas être négatif']
  },

  stock: {
    type: Number,
    required: [true, 'Le stock est obligatoire'],
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },

  lowStockThreshold: {
    type: Number,
    default: 5,
    min: [0, 'Le seuil de stock faible ne peut pas être négatif']
  },

  // ============================================
  // CATÉGORIE & ATTRIBUTS
  // ============================================
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La catégorie est obligatoire']
  },

  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  brand: {
    type: String,
    trim: true
  },

  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },

  // ============================================
  // IMAGES
  // ============================================
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // ============================================
  // CARACTÉRISTIQUES
  // ============================================
  features: [{
    type: String,
    trim: true
  }],

  specifications: {
    type: Map,
    of: String
  },

  // ============================================
  // LIVRAISON
  // ============================================
  weight: {
    type: Number,
    min: [0, 'Le poids ne peut pas être négatif']
  },

  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'm', 'inch'],
      default: 'cm'
    }
  },

  shipping: {
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: [0, 'Les frais de livraison ne peuvent pas être négatifs']
    },
    deliveryTime: {
      type: String,
      default: '2-5 jours'
    }
  },

  // ============================================
  // VENDEUR
  // ============================================
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Le vendeur est obligatoire']
  },

  // ============================================
  // STATUT & VISIBILITÉ
  // ============================================
  status: {
    type: String,
    enum: {
      values: ['brouillon', 'actif', 'inactif', 'epuise'],
      message: 'Statut invalide'
    },
    default: 'brouillon'
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  isPublished: {
    type: Boolean,
    default: false
  },

  // ============================================
  // STATISTIQUES
  // ============================================
  stats: {
    views: {
      type: Number,
      default: 0
    },
    sales: {
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
  // MÉTADONNÉES
  // ============================================
  metaTitle: {
    type: String,
    maxlength: [70, 'Le meta titre ne peut pas dépasser 70 caractères']
  },

  metaDescription: {
    type: String,
    maxlength: [160, 'La meta description ne peut pas dépasser 160 caractères']
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEX POUR OPTIMISATION
// ============================================
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'stats.sales': -1 });
productSchema.index({ 'stats.averageRating': -1 });
productSchema.index({ isFeatured: 1, isPublished: 1 });

// ============================================
// VIRTUALS
// ============================================

// Calcul de la réduction en pourcentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.comparePrice || this.comparePrice <= this.price) {
    return 0;
  }
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

// Vérifier si le produit est en rupture de stock
productSchema.virtual('isOutOfStock').get(function() {
  return this.stock <= 0;
});

// Vérifier si le stock est faible
productSchema.virtual('isLowStock').get(function() {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

// Image principale
productSchema.virtual('primaryImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : this.images[0].url;
});

// ============================================
// HOOKS (MIDDLEWARES MONGOOSE)
// ============================================

// Générer le slug automatiquement avant sauvegarde
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      + '-' + Date.now().toString(36);
  }
  next();
});

// Mettre à jour le statut automatiquement selon le stock
productSchema.pre('save', function(next) {
  if (this.stock <= 0) {
    this.status = 'epuise';
  } else if (this.status === 'epuise' && this.stock > 0) {
    this.status = 'actif';
  }
  next();
});

// ============================================
// MÉTHODES D'INSTANCE
// ============================================

// Réduire le stock
productSchema.methods.reduceStock = async function(quantity) {
  if (this.stock < quantity) {
    throw new Error('Stock insuffisant');
  }
  this.stock -= quantity;
  this.stats.sales += quantity;
  await this.save();
  return this;
};

// Augmenter le stock (retour produit)
productSchema.methods.increaseStock = async function(quantity) {
  this.stock += quantity;
  this.stats.sales = Math.max(0, this.stats.sales - quantity);
  await this.save();
  return this;
};

// Incrémenter les vues
productSchema.methods.incrementViews = async function() {
  this.stats.views += 1;
  await this.save();
  return this;
};

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Rechercher des produits
productSchema.statics.search = async function(query, filters = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    vendor,
    isFeatured,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 20
  } = filters;

  const searchQuery = { ...query };

  if (category) searchQuery.category = category;
  if (vendor) searchQuery.vendor = vendor;
  if (isFeatured !== undefined) searchQuery.isFeatured = isFeatured;
  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = minPrice;
    if (maxPrice) searchQuery.price.$lte = maxPrice;
  }

  // Statut par défaut : actif et publié
  if (!searchQuery.status) {
    searchQuery.status = 'actif';
    searchQuery.isPublished = true;
  }

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const [products, total] = await Promise.all([
    this.find(searchQuery)
      .populate('vendor', 'shopName avatar')
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    this.countDocuments(searchQuery)
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Produits populaires
productSchema.statics.getPopular = async function(limit = 10) {
  return await this.find({ 
    status: 'actif', 
    isPublished: true 
  })
    .sort({ 'stats.sales': -1 })
    .limit(limit)
    .populate('vendor', 'shopName')
    .populate('category', 'name');
};

// Produits en vedette
productSchema.statics.getFeatured = async function(limit = 8) {
  return await this.find({ 
    status: 'actif', 
    isPublished: true,
    isFeatured: true 
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('vendor', 'shopName')
    .populate('category', 'name');
};

// ============================================
// MODÈLE
// ============================================

const Product = mongoose.model('Product', productSchema);

export default Product;