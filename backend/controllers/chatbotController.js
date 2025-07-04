import ChatbotConversation from '../models/ChatbotConversation.js';

// Kullanıcının chatbot geçmişini getirir
export const getChatbotHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Kullanıcının konuşma geçmişini bul
    let convo = await ChatbotConversation.findOne({ userId }).lean();
    if (!convo) return res.json([]);

    // Yalnızca gerekli mesaj bilgilerini döndür
    return res.json(convo.messages.map(m => ({
      senderRole: m.senderRole,
      content:    m.content,
      model:      m.model,
      createdAt:  m.createdAt
    })));
  } catch (err) {
    console.error('getChatbotHistory error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Kullanıcının chatbot'a gönderdiği mesajı kaydeder
export const postChatbotMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, model } = req.body;
    const senderRole = 'user';

    // Geçerli model kontrolü
    if (!['openai', 'mistralAI'].includes(model)) {
      return res.status(400).json({ message: 'Geçersiz model' });
    }

    // Yeni konuşma oluştur ya da mevcut konuşmaya mesaj ekle
    const update = {
      $setOnInsert: { userId },
      $push: {
        messages: { senderId: userId, senderRole, content, model }
      }
    };

    const opts = { upsert: true, new: true };
    const convo = await ChatbotConversation.findOneAndUpdate({ userId }, update, opts);

    return res.status(201).json(convo);
  } catch (err) {
    console.error('postChatbotMessage error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Chatbot'un verdiği cevabı kaydeder
export const postChatbotReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, model } = req.body;
    const senderRole = 'chatbot';

    // Chatbot mesajını konuşmaya ekle
    const update = {
      $push: {
        messages: { senderId: null, senderRole, content, model }
      }
    };

    const convo = await ChatbotConversation.findOneAndUpdate(
      { userId },
      update,
      { new: true }
    );

    return res.status(201).json(convo);
  } catch (err) {
    console.error('postChatbotReply error:', err);
    res.status(500).json({ message: err.message });
  }
};