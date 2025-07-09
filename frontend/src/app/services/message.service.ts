import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { environment } from '../../environments/environment';
import { ParticipantRole } from '../models/participant.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/conversations`;

  constructor(private http: HttpClient) {}

  // Konuşmaya ait tüm mesajları getirir
  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/${conversationId}/messages`);
  }

  // Konuşmaya yeni mesaj gönderir
  sendMessage(
    conversationId: string,
    content: string,
    model?: 'OpenAI' | 'MistralAI',
    senderRole?: ParticipantRole
  ): Observable<Message> {
    const body: any = { content };
    if (model)      body.model = model;
    if (senderRole) body.senderRole = senderRole;

    return this.http.post<Message>(
      `${this.baseUrl}/${conversationId}/messages`,
      body
    );
  }
}