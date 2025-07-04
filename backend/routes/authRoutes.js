import express from 'express';
import {
  registerUser,
  loginUser,
  checkEmail,
  resetPassword,
  deleteOwnAccount,
  upgradeToPremium
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Yeni kullanıcı kaydı
router.post('/register', registerUser);

// Kullanıcı girişi
router.post('/login', loginUser);

// E-posta adresi sistemde kayıtlı mı kontrolü
router.post('/check-email', checkEmail);

// Şifre sıfırlama isteği
router.post('/reset-password', resetPassword);

// Kendi hesabını silme (giriş yapılmış olmalı)
router.delete('/me', verifyToken, deleteOwnAccount);

// Premium üyeliğe geçiş (giriş yapılmış olmalı)
router.put('/me/upgrade', verifyToken, upgradeToPremium);

export default router;