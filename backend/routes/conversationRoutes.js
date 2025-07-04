import express from 'express';
import {
  chatbotHistory,
  listConversations,
  createConversation,
  deleteConversation
} from '../controllers/conversationController.js';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Giriş yapan kullanıcının chatbot konuşma geçmişini getirir
router.get('/conversations/chatbot', verifyToken, chatbotHistory);

// Giriş yapan kullanıcının tüm konuşmalarını listeler
router.get('/conversations', verifyToken, listConversations);

// Yeni konuşma başlatır
router.post('/conversations', verifyToken, createConversation);

// Belirli bir konuşmanın mesajlarını getirir
router.get('/conversations/:id/messages', verifyToken, getMessages);

// Belirli bir konuşmaya yeni mesaj ekler
router.post('/conversations/:id/messages', verifyToken, sendMessage);

// Sadece chatbot tipi konuşmaları siler
router.delete('/conversations/:id', verifyToken, deleteConversation);

export default router;