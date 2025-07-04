import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Token doğrulama (tüm işlemler için zorunlu)
router.use(verifyToken);

// Kullanıcı kendi profilini günceller → PUT /me
router.put('/me', updateUser);

// Admin: Tüm kullanıcıları getirir → GET /
router.get('/', isAdmin, getAllUsers);

// Admin: Belirli bir kullanıcıyı getirir → GET /:id
router.get('/:id', isAdmin, getUserById);

// Admin: Kullanıcıyı siler → DELETE /:id
router.delete('/:id', isAdmin, deleteUser);

export default router;