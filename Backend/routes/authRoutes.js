import express from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Routes protégées
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidator, updateProfile);
router.put('/change-password', protect, changePasswordValidator, changePassword);

export default router;