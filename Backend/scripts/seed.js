import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Vendor from '../models/Vendor.js';

dotenv.config();

// Fonction pour générer un slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Date.now().toString(36);
};

const ADMIN = {
  name: 'Admin Sourang',
  email: 'admin@sourang.com',
  phone: '+221770000000',
  password: 'admin123',
  role: 'admin'
};

const VENDEUR_USER = {
  name: 'Tech Dakar',
  email: 'tech@sourang.com',
  phone: '+221771111111',
  password: 'vendeur123',
  role: 'client'
};

const VENDEUR_SHOP = {
  shopName: 'Tech Dakar Store',
  description: 'La meilleure boutique tech du Sénégal',
  contactPhone: '+221771111111',
  status: 'approved'
};

const CATEGORIES_DATA = [
  { name: 'Électronique', slug: 'electronique', description: 'Smartphones, ordinateurs' },
  { name: 'Mode', slug: 'mode', description: 'Vêtements, chaussures' },
  { name: 'Maison', slug: 'maison', description: 'Meubles, décoration' },
  { name: 'Beauté', slug: 'beaute', description: 'Cosmétiques, parfums' },
  { name: 'Alimentation', slug: 'alimentation', description: 'Produits alimentaires' },
  { name: 'Sports', slug: 'sports', description: 'Équipements sportifs' },
  { name: 'Auto-Moto', slug: 'auto-moto', description: 'Pièces auto' },
  { name: 'Bébé', slug: 'bebe', description: 'Articles bébé' }
];

const PRODUCTS_DATA = [
  {
    name: 'Smartphone Samsung Galaxy A54',
    description: 'Smartphone haute performance avec écran AMOLED 6.4", 128GB et triple caméra 50MP.',
    price: 185000,
    comparePrice: 220000,
    stock: 15,
    category: 'electronique',
    tags: ['samsung', 'smartphone'],
    brand: 'Samsung',
    features: ['Écran AMOLED 6.4"', '128GB', 'Triple caméra 50MP'],
    isFeatured: true,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Robe traditionnelle Bazin riche',
    description: 'Magnifique robe en bazin riche brodée à la main, parfaite pour les cérémonies.',
    price: 45000,
    stock: 8,
    category: 'mode',
    tags: ['bazin', 'tradition'],
    features: ['Bazin riche', 'Broderie main'],
    isFeatured: true,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Ordinateur portable HP Pavilion',
    description: 'PC portable Intel Core i5, 8GB RAM, 512GB SSD.',
    price: 450000,
    comparePrice: 520000,
    stock: 5,
    category: 'electronique',
    tags: ['hp', 'laptop'],
    brand: 'HP',
    features: ['Intel Core i5', '8GB RAM', '512GB SSD'],
    isFeatured: true,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Ensemble salon moderne 5 places',
    description: 'Salon confortable en tissu premium, design moderne.',
    price: 275000,
    stock: 3,
    category: 'maison',
    tags: ['salon', 'meuble'],
    features: ['5 places', 'Tissu premium'],
    isFeatured: true,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Parfum oriental Oud Royal 100ml',
    description: 'Parfum oriental luxueux aux notes de oud, longue tenue 12h+.',
    price: 35000,
    comparePrice: 42000,
    stock: 25,
    category: 'beaute',
    tags: ['parfum', 'oud'],
    features: ['100ml', 'Tenue 12h+'],
    isFeatured: true,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Riz brisé Thai Hom Mali 25kg',
    description: 'Riz brisé de qualité supérieure, importé de Thaïlande.',
    price: 18500,
    stock: 50,
    category: 'alimentation',
    tags: ['riz', 'thai'],
    features: ['25kg', 'Qualité supérieure'],
    isFeatured: false,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Ballon Adidas officiel taille 5',
    description: 'Ballon de football officiel Adidas, qualité match.',
    price: 25000,
    comparePrice: 30000,
    stock: 20,
    category: 'sports',
    tags: ['adidas', 'football'],
    brand: 'Adidas',
    features: ['Taille 5', 'Qualité match'],
    isFeatured: false,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Montre connectée Smart Watch Pro',
    description: 'Montre connectée avec suivi santé, GPS, autonomie 7 jours.',
    price: 65000,
    comparePrice: 85000,
    stock: 12,
    category: 'electronique',
    tags: ['montre', 'smartwatch'],
    features: ['GPS', 'Suivi santé', 'Autonomie 7j'],
    isFeatured: true,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Thiéboudienne prêt-à-cuire',
    description: 'Kit complet thiéboudienne traditionnel sénégalais.',
    price: 8500,
    stock: 30,
    category: 'alimentation',
    tags: ['thiéboudienne', 'tradition'],
    features: ['Prêt en 30min', 'Ingrédients frais'],
    isFeatured: true,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Sac à main cuir véritable',
    description: 'Sac à main en cuir véritable, design élégant.',
    price: 28000,
    comparePrice: 35000,
    stock: 10,
    category: 'mode',
    tags: ['sac', 'cuir'],
    features: ['Cuir véritable', 'Artisanal'],
    isFeatured: false,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Climatiseur split 12000 BTU',
    description: 'Climatiseur inverter économique, installation offerte.',
    price: 195000,
    comparePrice: 230000,
    stock: 7,
    category: 'maison',
    tags: ['climatiseur'],
    features: ['12000 BTU', 'Inverter'],
    isFeatured: false,
    isPublished: true,
    status: 'actif'
  },
  {
    name: 'Écouteurs Bluetooth sans fil',
    description: 'Écouteurs Bluetooth 5.0, réduction de bruit, autonomie 24h.',
    price: 22000,
    comparePrice: 28000,
    stock: 40,
    category: 'electronique',
    tags: ['écouteurs', 'bluetooth'],
    features: ['Bluetooth 5.0', 'Autonomie 24h'],
    isFeatured: true,
    isPublished: true,
    status: 'actif'
  }
];

const seedDatabase = async () => {
  try {
    console.log('');
    console.log('🌱 SEED DATABASE - SOURANG MARKET');
    console.log('');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sourang-market');
    console.log('✅ MongoDB connecté');

    console.log('🗑️  Nettoyage...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Vendor.deleteMany({})
    ]);
    console.log('✅ Nettoyé');

    console.log('👑 Création admin...');
    const admin = await User.create(ADMIN);
    console.log(`✅ Admin : ${admin.email} / admin123`);

    console.log('🏪 Création vendeur...');
    const vendorUser = await User.create(VENDEUR_USER);
    const vendor = await Vendor.create({
      ...VENDEUR_SHOP,
      user: vendorUser._id,
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: admin._id
    });
    console.log(`✅ Vendeur : ${vendor.shopName}`);

    console.log('📂 Création catégories...');
    const categories = await Category.insertMany(CATEGORIES_DATA);
    console.log(`✅ ${categories.length} catégories`);

    const categoryMap = {};
    categories.forEach(cat => { categoryMap[cat.slug] = cat._id; });

    console.log('📦 Création produits...');
    
    // Créer les produits un par un pour déclencher les hooks
    const products = [];
    for (const p of PRODUCTS_DATA) {
      const product = await Product.create({
        name: p.name,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        stock: p.stock,
        category: categoryMap[p.category],
        vendor: vendor._id,
        tags: p.tags,
        brand: p.brand,
        features: p.features,
        isFeatured: p.isFeatured,
        isPublished: p.isPublished,
        status: p.status,
        images: [{
          url: `https://picsum.photos/seed/${p.name.replace(/\s/g, '')}/500/500`,
          alt: p.name,
          isPrimary: true
        }],
        shipping: {
          freeShipping: p.price >= 50000,
          shippingFee: p.price >= 50000 ? 0 : 2000,
          deliveryTime: '2-5 jours'
        }
      });
      products.push(product);
    }
    
    console.log(`✅ ${products.length} produits`);

    await vendor.updateStats();

    console.log('');
    console.log('═══════════════════════════════════');
    console.log('📊 RÉSUMÉ');
    console.log('═══════════════════════════════════');
    console.log(`👑 Admin : admin@sourang.com / admin123`);
    console.log(`🏪 Vendeur : tech@sourang.com / vendeur123`);
    console.log(`📂 Catégories : ${categories.length}`);
    console.log(`📦 Produits : ${products.length}`);
    console.log('═══════════════════════════════════');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();