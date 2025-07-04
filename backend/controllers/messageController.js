import mongoose from 'mongoose';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';

// Bir konuşmanın tüm mesajlarını kronolojik olarak getirir
export async function getMessages(req, res) {
  try {
    const conversationId = req.params.id;
    const msgs = await Message.find({ conversationId }).sort('createdAt');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Konuşmaya yeni bir mesaj gönderir (izin ve rol kontrolü içerir)
export async function sendMessage(req, res) {
  try {
    const conversationId    = req.params.id;
    const senderIdStr       = req.user?.id || null;
    const senderObjectId    = senderIdStr
      ? new mongoose.Types.ObjectId(senderIdStr)
      : null;
    const { content, model, senderRole: forcedRole } = req.body;
    const modelUsed = (model || '').toLowerCase();

    // 1) Konuşma mevcut mu kontrol et
    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation bulunamadı.' });
    }

    // 2) Gönderici konuşma katılımcısı mı kontrol et
    if (!senderObjectId) {
      // Sadece chatbot konuşmalarında misafir mesaj atabilir
      if (conv.type === 'user-chatbot' || conv.type === 'lawyer-chatbot') {
        // izin verildi, devam et
      } else {
        return res.status(403).json({ error: 'Bu konuşmaya mesaj gönderme izniniz yok.' });
      }
    } else if (
      !conv.participants.some(p => p.userId.equals(senderObjectId))
    ) {
      return res.status(403).json({ error: 'Bu konuşmaya mesaj gönderme izniniz yok.' });
    }

    // 3) Gönderici rolü belirle (User, Lawyer, Chatbot)
    let senderRole;
    if (forcedRole) {
      senderRole = forcedRole;
    } else {
      const raw = (req.user.role || '').toLowerCase();
      senderRole =
        raw === 'user'   ? 'User'   :
        raw === 'lawyer' ? 'Lawyer' :
        /* else */       'Chatbot';
    }

    // 4) Giriş yapan kullanıcının mesajı veritabanına kaydedilir
    let msg;
    if (senderObjectId) {
      msg = await Message.create({
        conversationId,
        senderId:   senderObjectId,
        senderRole,
        content,
        modelUsed: modelUsed || null
      });
    } else {
      // Misafir kullanıcıdan gelen mesaj sadece sahte nesne olarak döndürülür
      msg = {
        _id:           null,
        conversationId,
        senderId:      null,
        senderRole,
        content,
        modelUsed:    modelUsed || null,
        createdAt:    new Date()
      };
    }

    return res.status(201).json(msg);

  } catch (err) {
    console.error('[sendMessage ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
}