import asyncHandler from 'express-async-handler';
import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

// ============================================
// CRÉER UNE DEMANDE VENDEUR
// ============================================
export const createVendor = asyncHandler(async (req, res) => {
  const { shopName, description, contactPhone, address, paymentInfo } = req.body;

  // Vérifier si l'utilisateur a déjà une boutique
  const existingVendor = await Vendor.findOne({ user: req.user._id });
  if (existingVendor) {
    res.status(400);
    throw new Error('Une boutique est déjà associée à votre compte');
  }

  // Vérifier si le nom de boutique existe
  const existingShop = await Vendor.findOne({ shopName });
  if (existingShop) {
    res.status(400);
    throw new Error('Ce nom de boutique est déjà utilisé');
  }

  // Images uploadées
  const vendorData = {
    user: req.user._id,
    shopName,
    description,
    contactPhone,
    address,
    paymentInfo: paymentInfo || { method: 'wave', phoneNumber: contactPhone }
  };

  if (req.files?.logo?.[0]) {
    vendorData.logo = `/uploads/vendors/${req.files.logo[0].filename}`;
  }
  if (req.files?.banner?.[0]) {
    vendorData.banner = `/uploads/vendors/${req.files.banner[0].filename}`;
  }

  const vendor = await Vendor.create(vendorData);

  res.status(201).json({
    success: true,
    message: 'Demande de boutique envoyée. En attente d\'approbation par l\'admin.',
    data: vendor
  });
});

// ============================================
// OBTENIR MA BOUTIQUE
// ============================================
export const getMyVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id })
    .populate('user', 'name email phone avatar');

  if (!vendor) {
    res.status(404);
    throw new Error('Boutique non trouvée');
  }

  res.json({
    success: true,
    data: vendor
  });
});

// ============================================
// METTRE À JOUR MA BOUTIQUE
// ============================================
export const updateVendor = asyncHandler(async (req, res) => {
  let vendor = await Vendor.findOne({ user: req.user._id });

  if (!vendor) {
    res.status(404);
    throw new Error('Boutique non trouvée');
  }

  if (req.files?.logo?.[0]) {
    req.body.logo = `/uploads/vendors/${req.files.logo[0].filename}`;
  }
  if (req.files?.banner?.[0]) {
    req.body.banner = `/uploads/vendors/${req.files.banner[0].filename}`;
  }

  vendor = await Vendor.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Boutique mise à jour',
    data: vendor
  });
});

// ============================================
// OBTENIR LES STATISTIQUES VENDEUR
// ============================================
export const getVendorStats = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id });
  if (!vendor) {
    res.status(404);
    throw new Error('Boutique non trouvée');
  }

  await vendor.updateStats();

  res.json({
    success: true,
    data: {
      stats: vendor.stats,
      balance: vendor.balance,
      status: vendor.status
    }
  });
});

// ============================================
// ADMIN : LISTE DES VENDEURS EN ATTENTE
// ============================================
export const getPendingVendors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await Vendor.getPendingVendors(parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.vendors,
    pagination: result.pagination
  });
});

// ============================================
// ADMIN : APPROUVER UN VENDEUR
// ============================================
export const approveVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { note } = req.body;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    res.status(404);
    throw new Error('Vendeur non trouvé');
  }

  await vendor.approve(req.user._id, note);

  res.json({
    success: true,
    message: 'Vendeur approuvé avec succès',
    data: vendor
  });
});

// ============================================
// ADMIN : SUSPENDRE UN VENDEUR
// ============================================
export const suspendVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { reason } = req.body;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    res.status(404);
    throw new Error('Vendeur non trouvé');
  }

  await vendor.suspend(reason);

  res.json({
    success: true,
    message: 'Vendeur suspendu',
    data: vendor
  });
});

// ============================================
// VALIDATEURS
// ============================================
export const createVendorValidator = [
  body('shopName')
    .trim()
    .notEmpty().withMessage('Le nom de la boutique est obligatoire')
    .isLength({ min: 3, max: 100 }).withMessage('Le nom doit contenir entre 3 et 100 caractères'),
  
  body('contactPhone')
    .optional()
    .trim()
    .matches(/^(\+221)?[37][05678]\d{7}$/).withMessage('Numéro de téléphone invalide'),
  
  validate
];

export const updateVendorValidator = [
  body('shopName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Le nom doit contenir entre 3 et 100 caractères'),
  
  validate
];