export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'User' | 'Lawyer' | 'Chatbot';
  content: string;
  modelUsed?: 'OpenAI' | 'LocalModel';
  createdAt: string;
  updatedAt: string;
}