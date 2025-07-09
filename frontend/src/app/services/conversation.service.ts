import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Conversation } from '../models/conversation.model';
import { environment } from '../../environments/environment';
import { ConversationSummary } from '../models/conversation-summary.model';
import { Message } from '../models/message.model';
import { ParticipantRole } from '../models/participant.model';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/conversations`;

  private historyUpdated = new Subject<void>();
  historyUpdated$ = this.historyUpdated.asObservable();
  
  constructor(private http: HttpClient) {}

  // Kullanıcının veya avukatın katıldığı tüm konuşmaları listeler
  listConversations(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(`${this.baseUrl}`);
  }

  // Chatbot geçmiş konuşmalarını listeler
  chatbotHistory(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(`${this.baseUrl}/chatbot`)
      .pipe(tap(() => {/* sadece tetikleme */}));
  }

  // Yeni bir konuşma oluşturur
  createConversation(
    participants: { userId: string; role: ParticipantRole }[],
    type: 'user-lawyer' | 'user-chatbot' | 'lawyer-chatbot'
  ): Observable<Conversation> {
    return this.http.post<Conversation>(this.baseUrl, { participants, type }).pipe(
      tap(() => this.historyUpdated.next())
    );
  }

  // Bir conversation (sadece chatbot tipi) siler
  deleteConversation(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}