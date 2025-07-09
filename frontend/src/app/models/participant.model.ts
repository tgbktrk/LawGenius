/** Sunucu modellerindeki tüm roller */
export type ParticipantRole = 'User' | 'Lawyer' | 'Chatbot' | 'System';

/** Frontend’de kullanacağımız roller (System hariç) */
export type FrontendRole = Exclude<ParticipantRole, 'System'>;

/** Conversation katılımcısı */
export interface Participant {
  userId: string;
  role:   FrontendRole;  // sadece 'User' | 'Lawyer' | 'Chatbot'
}