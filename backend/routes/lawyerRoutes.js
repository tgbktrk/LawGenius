import express from 'express';
import {
  getLawyerProfile,
  updateLawyerProfile,
  registerLawyer,
  fullRegisterLawyer,
  getPendingLawyers,
  getApprovedLawyers,
  getApprovedLawyersPublic,
  approveLawyer,
  rejectLawyer,
  deleteLawyer,
  getLawyerById
} from '../controllers/lawyerController.js';

import { verifyToken, isAdmin, optionalAuth } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Avukat başvurusu (giriş yapmış kullanıcı) → POST /register
router.post('/register', optionalAuth, upload.fields([
  { name: 'documents', maxCount: 5 },
  { name: 'profilePhoto', maxCount: 1 }
]), registerLawyer);

// Avukat kaydı + başvuru birlikte (yeni kullanıcı) → POST /full-register
router.post('/full-register', optionalAuth, upload.fields([
  { name: 'documents', maxCount: 5 },
  { name: 'profilePhoto', maxCount: 1 }
]), fullRegisterLawyer);

// ---------------------------------------------------
// Token doğrulama (tüm aşağıdaki işlemler için zorunlu)
// ---------------------------------------------------
router.use(verifyToken);

// Avukat kendi profilini getirir → GET /me
router.get('/me', getLawyerProfile);

// Avukat kendi profilini günceller → PUT /me
router.put('/me', updateLawyerProfile);

// Admin: Onay bekleyen avukatları listeler → GET /pending
router.get('/pending', isAdmin, getPendingLawyers);

// Admin: Onaylı avukatları listeler → GET /approved
router.get('/approved', isAdmin, getApprovedLawyers);

// Herkese açık: Onaylı avukatlar → GET /approved-public
router.get('/approved-public', getApprovedLawyersPublic);

// Admin: Avukat başvurusunu onaylar → PATCH /approve/:lawyerId
router.patch('/approve/:lawyerId', isAdmin, approveLawyer);

// Admin: Avukat başvurusunu reddeder → DELETE /reject/:lawyerId
router.delete('/reject/:lawyerId', isAdmin, rejectLawyer);

// Admin: Avukatı tamamen siler → DELETE /:lawyerId
router.delete('/:lawyerId', isAdmin, deleteLawyer);

// Admin: Avukatı ID ile getirir → GET /:lawyerId
router.get('/:lawyerId', isAdmin, getLawyerById);

export default router;