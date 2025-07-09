export interface ConversationSummary {
  _id:           string;
  otherUser:     { _id: string; name: string };
  lastMessage?:  string;
  lastMessageAt?: string;
  createdAt:     string;                   
  type:          'user-lawyer'                      
                | 'user-chatbot'
                | 'lawyer-chatbot';
}