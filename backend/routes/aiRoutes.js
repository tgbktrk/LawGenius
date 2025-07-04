import express from 'express';
import { verifyToken, optionalAuth } from '../middleware/authMiddleware.js';
import { handleAsk } from '../controllers/aiController.js';

const router = express.Router();

// Yapay zekaya soru sorma endpoint'i
router.post(
  '/ask',
  (req, res, next) => {
    // Model bilgisi alınır ve küçük harfe çevrilir
    const raw = req.body.model;
    const model = (req.body.model || '').toLowerCase();
    console.log('[aiRoutes] raw model:', raw, '→ lowerModel:', model);

    // Eğer model openai ise, token zorunlu (giriş yapılmış olmalı)
    if (model === 'openai') {
      return verifyToken(req, res, next);
    }

    // Diğer modeller için giriş opsiyoneldir
    return optionalAuth(req, res, next);
  },
  handleAsk // AI cevabını işleyen controller
);

export default router;