import { Participant } from './participant.model';

export interface Conversation {
  _id: string;
  participants: Participant[];
  type: 'user-lawyer' | 'user-chatbot' | 'lawyer-chatbot';
  createdAt: string;
}
