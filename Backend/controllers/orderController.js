import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

// ============================================
// CRÉER UNE COMMANDE
// ============================================
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, customerNote } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Le panier ne peut pas être vide');
  }

  let subtotal = 0;
  const orderItems = [];
  const vendorMap = new Map();

  // Vérifier les stocks et calculer les totaux
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Produit ${item.product} non trouvé`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Stock insuffisant pour ${product.name}`);
    }

    const itemSubtotal = product.price * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
      vendor: product.vendor,
      subtotal: itemSubtotal
    });

    // Regrouper par vendeur pour les gains
    const vendorId = product.vendor.toString();
    if (!vendorMap.has(vendorId)) {
      vendorMap.set(vendorId, { vendor: product.vendor, amount: 0 });
    }
    vendorMap.get(vendorId).amount += itemSubtotal;

    // Réduire le stock
    await product.reduceStock(item.quantity);
  }

  const shippingFee = subtotal >= 50000 ? 0 : 2000;
  const totalAmount = subtotal + shippingFee;

  // Créer la commande
  const order = await Order.create({
    customer: req.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    shippingFee,
    totalAmount,
    paymentMethod,
    customerNote,
    vendorEarnings: Array.from(vendorMap.values()).map(v => ({
      vendor: v.vendor,
      amount: v.amount,
      commission: (v.amount * 0.1), // 10% commission par défaut
      netAmount: v.amount * 0.9
    }))
  });

  // Mettre à jour les stats des vendeurs
  for (const vendorId of vendorMap.keys()) {
    const vendor = await Vendor.findById(vendorId);
    if (vendor) await vendor.updateStats();
  }

  res.status(201).json({
    success: true,
    message: 'Commande créée avec succès',
    data: order
  });
});

// ============================================
// OBTENIR MES COMMANDES
// ============================================
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { customer: req.user._id };
  if (status) query.orderStatus = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// ============================================
// OBTENIR UNE COMMANDE PAR ID
// ============================================
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images')
    .populate('customer', 'name email phone');

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Vérifier les permissions (client, vendeur concerné ou admin)
  const isCustomer = order.customer._id.toString() === req.user._id;
  const isVendor = order.items.some(item => item.vendor.toString() === req.user.vendorId);
  const isAdmin = req.user.role === 'admin';

  if (!isCustomer && !isVendor && !isAdmin) {
    res.status(403);
    throw new Error('Accès non autorisé à cette commande');
  }

  res.json({
    success: true,
    data: order
  });
});

// ============================================
// METTRE À JOUR LE STATUT DE COMMANDE
// ============================================
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  await order.updateStatus(status, req.body.note || '', req.user._id);

  res.json({
    success: true,
    message: 'Statut de la commande mis à jour',
    data: order
  });
});

// ============================================
// COMMANDES D'UN VENDEUR
// ============================================
export const getVendorOrders = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) {
    res.status(404);
    throw new Error('Boutique non trouvée');
  }

  const { page = 1, limit = 20, status } = req.query;
  const result = await Order.getVendorOrders(vendor._id, status, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.orders,
    pagination: result.pagination
  });
});

// ============================================
// VALIDATEURS
// ============================================
export const createOrderValidator = [
  body('items').isArray({ min: 1 }).withMessage('Le panier doit contenir au moins un article'),
  body('items.*.product').isMongoId().withMessage('ID produit invalide'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('La quantité doit être supérieure à 0'),
  
  body('shippingAddress.fullName').notEmpty().withMessage('Nom du destinataire requis'),
  body('shippingAddress.phone').matches(/^(\+221)?[37][05678]\d{7}$/).withMessage('Téléphone invalide'),
  body('shippingAddress.street').notEmpty().withMessage('Adresse requise'),
  body('shippingAddress.city').notEmpty().withMessage('Ville requise'),
  body('shippingAddress.region').notEmpty().withMessage('Région requise'),
  
  body('paymentMethod').isIn(['wave', 'orange_money', 'cash_on_delivery']).withMessage('Méthode de paiement invalide'),
  
  validate
];