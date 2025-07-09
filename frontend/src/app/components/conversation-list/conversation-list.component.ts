import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConversationService } from '../../services/conversation.service';
import { AuthService }         from '../../services/auth.service';
import { ConversationSummary } from '../../models/conversation-summary.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conversation-list',
  standalone: false,
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.scss'
})
export class ConversationListComponent implements OnInit {
  // Konuşma seçildiğinde parent bileşene ID’yi gönderir
  @Output() selectConv = new EventEmitter<string>();

  // Gelen konuşmalar burada saklanır
  inbox: ConversationSummary[] = [];

  // Giriş yapan kişinin rolü (user veya lawyer)
  currentUserRole: 'user' | 'lawyer';

  constructor(
    private convSvc: ConversationService,
    private auth:     AuthService,
    private router:   Router
  ) {
    // Kullanıcı rolünü belirle (case insensitive)
    const role = this.auth.getUser()!.role.toLowerCase();
    this.currentUserRole = (role === 'lawyer') ? 'lawyer' : 'user';
  }

  ngOnInit(): void {
    console.log('[ConversationList] role =', this.currentUserRole);

    // Tüm konuşmaları getir
    this.convSvc.listConversations().subscribe({
      next: (convs: ConversationSummary[]) => {
        console.log('[ConversationList] received convs:', convs);

        // Sadece kullanıcı-avukat sohbetleri ve son mesaj tarihine göre sırala
        this.inbox = convs
          .filter(c => c.type === 'user-lawyer')
          .sort((a, b) => {
            const tA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const tB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return tB - tA;
          });
      },
      error: (err: any) => console.error('[ConversationList] load error:', err)
    });
  }

  //Seçilen konuşmayı yönlendirerek açar
  openConversation(convId: string): void {
    this.router.navigate(['/conversation', convId]);
  }
}