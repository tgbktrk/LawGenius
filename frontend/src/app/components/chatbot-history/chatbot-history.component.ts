import { Component, OnInit } from '@angular/core';
import { ConversationService } from '../../services/conversation.service';
import { Router } from '@angular/router';
import { ConversationSummary } from '../../models/conversation-summary.model';
import { catchError, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-chatbot-history',
  standalone: false,
  templateUrl: './chatbot-history.component.html',
  styleUrls: ['./chatbot-history.component.scss']
})
export class ChatbotHistoryComponent implements OnInit {
  // Sohbet geçmişi listesi
  histories: ConversationSummary[] = [];

  constructor(
    private convSvc: ConversationService,
    private router: Router,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Bileşen yüklendiğinde geçmiş konuşmaları al
    this.loadHistory();

    // Yeni konuşma eklendiğinde geçmişi güncelle
    this.convSvc.historyUpdated$.subscribe(() => this.loadHistory());
  }

  // Chatbot konuşma geçmişini yükle
  private loadHistory() {
    this.convSvc.chatbotHistory()
      .pipe(
        catchError(err => {
          // 401/403 gibi hatalarda boş liste göster
          console.warn('ChatbotHistory load failed, showing empty', err);
          return of([]);
        })
      )
      .subscribe(hs => this.histories = hs);
  }

  // Geçmişten bir konuşmayı başlat
  startChat(conversationId?: string): void {
    if (conversationId) {
      // Mevcut konuşmayı aç
      this.router.navigate(['/chatbot', conversationId]);
    } else {
      // Yeni konuşma başlat (henüz backend'e kayıt yapılmaz)
      this.router.navigate(['/chatbot']);
    }
  }

  // Geçmişteki bir konuşmayı sil
  deleteConversation(convId: string, event: MouseEvent) {
    event.stopPropagation(); // Kartın tıklanmasını engelle

    const confirmDelete = this.translate.instant('chat.history.confirm_delete');
    if (!confirm(confirmDelete)) return;

    this.convSvc.deleteConversation(convId).subscribe({
      next: () => {
        // UI'dan sil
        this.histories = this.histories.filter(h => h._id !== convId);
        this.toastr.success(this.translate.instant('chat.history.deleted'));
      },
      error: err => {
        console.error('Silme hatası:', err);
        this.toastr.error(this.translate.instant('chat.history.delete_failed'));
      }
    });
  }
}