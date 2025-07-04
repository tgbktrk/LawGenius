import mongoose from 'mongoose';

// Konuşma katılımcılarını temsil eden alt şema (User, Lawyer, Chatbot)
const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'participants.role' },
  role:   { type: String, enum: ['User', 'Lawyer', 'Chatbot'], required: true }
}, { _id: false });

// Ana konuşma şeması (2 katılımcı, belirli konuşma tipi, tarih)
const conversationSchema = new mongoose.Schema({
  participants: {
    type: [participantSchema],
    validate: {
      validator: v => v.length === 2,
      message: 'Konuşmada yalnızca iki katılımcı olmalı (insan ve diğer taraf: Avukat/Chatbot).'
    }
  },
  type: {
    type: String,
    enum: ['user-lawyer', 'user-chatbot', 'lawyer-chatbot'],
    required: true,
    description: 'Konuşma tipi: kullanıcı-avukat, kullanıcı-chatbot veya avukat-chatbot'
  },
  createdAt: { type: Date, default: Date.now }
});

// Conversation modelini tanımlayıp dışa aktar
export const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;