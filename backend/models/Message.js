import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

// Chatbot mesajlarında kullanılacak sabit BOT_ID
export const BOT_ID = new Types.ObjectId('000000000000000000000000');

// Mesaj şeması tanımı
const messageSchema = new Schema({
  // Mesajın ait olduğu konuşma (opsiyonel, misafirler için)
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: false
  },
  // Gönderenin kullanıcı kimliği (zorunlu, chatbot ise varsayılan BOT_ID)
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    default: BOT_ID
  },
  // Gönderenin rolü (User, Lawyer, Chatbot)
  senderRole: {
    type: String,
    enum: ['User', 'Lawyer', 'Chatbot'],
    required: true
  },
  // Mesaj içeriği
  content: {
    type: String,
    required: true
  },
  // Kullanılan yapay zeka modeli (opsiyonel)
  modelUsed: {
    type: String,
    enum: ['openai', 'mistralai'],
    required: false
  }
}, { timestamps: true });

// Chatbot mesajlarında senderId boşsa otomatik BOT_ID ata
messageSchema.pre('validate', function(next) {
  if (this.senderRole === 'Chatbot' && !this.senderId) {
    this.senderId = BOT_ID;
  }
  next();
});

// Message modelini tanımlayıp dışa aktar
export const Message = mongoose.model('Message', messageSchema);
export default Message;