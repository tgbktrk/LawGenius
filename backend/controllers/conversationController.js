import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const { ObjectId } = mongoose.mongo; // ObjectId kısayolu

// Kullanıcının chatbot konuşma geçmişini getirir
export async function chatbotHistory(req, res) {
  try {
    if (!req.user?.id) return res.json([]);
    const meId = new ObjectId(req.user.id);
    const type = req.user.role === 'lawyer' ? 'lawyer-chatbot' : 'user-chatbot';

    const convs = await Conversation.aggregate([
      { $match: { type, 'participants.userId': meId } },
      { $lookup: {
          from: 'messages',
          let: { cid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$conversationId','$$cid'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project:{ content:1, createdAt:1 } }
          ],
          as: 'lastMsg'
      }},
      { $addFields: {
          lastMessage: { $arrayElemAt: ['$lastMsg.content',0] },
          lastMessageAt: { $arrayElemAt: ['$lastMsg.createdAt',0] }
      }},
      { $project: { participants:0, lastMsg:0 } },
      { $sort: { lastMessageAt: -1 } }
    ]);

    return res.json(convs);
  } catch (err) {
    console.error('[chatbotHistory ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
}

// Kullanıcının user-lawyer sohbetlerini listeler, silinmiş hesapları isimle belirtir
export async function listConversations(req, res) {
  try {
    const meId = new ObjectId(req.user.id || req.user._id);

    const convs = await Conversation.aggregate([
      { $match: { 'participants.userId': meId, type: 'user-lawyer' } },
      { $lookup: {
          from: 'messages', let: { convId: '$_id' }, pipeline: [
            { $match: { $expr: { $eq: ['$conversationId','$$convId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { content:1, createdAt:1 } }
          ], as: 'lastMsg'
      }},
      { $addFields: {
          lastMessage: { $arrayElemAt: ['$lastMsg.content',0] },
          lastMessageAt: { $arrayElemAt: ['$lastMsg.createdAt',0] }
      }},
      { $addFields: {
          other: {
            $filter: {
              input: '$participants',
              cond: { $ne: ['$$this.userId', meId] }
            }
          }
      }},
      { $unwind: '$other' },
      { $lookup: { from: 'users', localField: 'other.userId', foreignField: '_id', as: 'userData' }},
      { $lookup: { from: 'lawyers', localField: 'other.userId', foreignField: '_id', as: 'lawyerData' }},
      { $addFields: {
          otherUser: {
            $cond: [
              { $eq: ['$other.role','User'] },
              { $arrayElemAt: ['$userData',0] },
              { $arrayElemAt: ['$lawyerData',0] }
            ]
          }
      }},
      { $addFields: {
        'otherUser.name': {
          $switch: {
            branches: [
              {
                case: { $and: [{ $eq: ['$otherUser.role','user'] }, { $eq: ['$otherUser.isDeleted',true] }] },
                then: 'Silinmiş Kullanıcı'
              },
              {
                case: { $and: [{ $eq: ['$otherUser.role','lawyer'] }, { $eq: ['$otherUser.isDeleted',true] }] },
                then: 'Silinmiş Avukat'
              }
            ],
            default: '$otherUser.name'
          }
        }
      }},
      { $project: {
          _id:1, type:1, lastMessage:1, lastMessageAt:1, createdAt:1,
          'otherUser._id':1, 'otherUser.name':1
      }},
      { $sort: { lastMessageAt: -1 } }
    ]);

    return res.json(convs);
  } catch (err) {
    console.error('[listConversations ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
}

// Yeni konuşma başlatır, varsa mevcut olanı döner; user-lawyer için ücretsiz kullanıcıya aylık 5 limit uygular
export async function createConversation(req, res) {
  try {
    const { participants, type } = req.body;
    const userId = req.user.id;
    const roleRaw = (req.user.role || '').toLowerCase();

    if ((type === 'user-lawyer' || type === 'user-chatbot') && roleRaw !== 'user') {
      return res.status(403).json({ error: 'Sadece kullanıcılar bu tür başlatabilir.' });
    }
    if (type === 'lawyer-chatbot' && roleRaw !== 'lawyer') {
      return res.status(403).json({ error: 'Sadece avukatlar başlatabilir.' });
    }
    if (type === 'user-lawyer' && roleRaw === 'lawyer') {
      return res.status(403).json({ error: 'Avukatlar başka bir avukatla sohbet başlatamaz.' });
    }
    if (!Array.isArray(participants) || participants.length !== 2) {
      return res.status(400).json({ error: 'İki katılımcı gerekiyor.' });
    }

    if (type === 'user-lawyer') {
      const user = await User.findById(userId).select('isPremium');
      if (!user.isPremium) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
        const count = await Conversation.countDocuments({
          type: 'user-lawyer',
          'participants.userId': new ObjectId(userId),
          createdAt: { $gte: startOfMonth }
        });
        if (count >= 5) {
          return res.status(403).json({ error: 'Ücretsiz olarak ayda en fazla 5 avukat sohbeti açabilirsiniz. Premium olun.' });
        }
      }
    }

    let conv;
    if (type === 'user-chatbot' || type === 'lawyer-chatbot') {
      conv = await Conversation.create({ participants, type });
    } else {
      conv = await Conversation.findOne({
        type,
        participants: { $all: participants.map(p => ({ $elemMatch: p })) }
      });
      if (!conv) {
        conv = await Conversation.create({ participants, type });
      }
    }

    return res.status(201).json(conv);
  } catch (err) {
    console.error('[createConversation ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
}

// Chatbot konuşmasını (ve mesajlarını) siler; yalnızca chatbot konuşmaları silinebilir
export async function deleteConversation(req, res) {
  try {
    const convId = req.params.id;
    const meId = req.user.id;

    const conv = await Conversation.findById(convId);
    if (!conv) return res.status(404).json({ error: 'Conversation bulunamadı.' });
    if (conv.type !== 'user-chatbot' && conv.type !== 'lawyer-chatbot') {
      return res.status(403).json({ error: 'Yalnızca chatbot geçmişi silinebilir.' });
    }

    const isParticipant = conv.participants.some(p => p.userId.toString() === meId);
    if (!isParticipant) return res.status(403).json({ error: 'Bu kaydı silme izniniz yok.' });

    await Message.deleteMany({ conversationId: convId });
    await Conversation.findByIdAndDelete(convId);

    return res.json({ message: 'Chatbot geçmişi başarıyla silindi.' });
  } catch (err) {
    console.error('[deleteConversation ERROR]', err);
    return res.status(500).json({ error: 'Sunucu hatası. Tekrar deneyin.' });
  }
}