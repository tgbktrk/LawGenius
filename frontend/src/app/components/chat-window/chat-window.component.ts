import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-chat-window',
  standalone: false,
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss'
})
export class ChatWindowComponent implements OnInit, AfterViewChecked {
  // Konuşma ID'si ve mesaj listesi
  conversationId!: string;
  messages: Message[] = [];
  newMessage: string = '';

  // Scroll alanına erişim için referans
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private auth: AuthService
  ) {}

  // Konuşma ID'sini al ve mesajları yükle
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.conversationId = params['id'];
      this.loadMessages();
    });
  }

  // Yeni mesaj eklendikçe otomatik kaydır
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // Mesajları API'den çek
  private loadMessages(): void {
    this.msgSvc.getMessages(this.conversationId).subscribe({
      next: msgs => {
        this.messages = msgs;
      },
      error: err => console.error('[ChatWindow] Mesajlar yüklenemedi:', err)
    });
  }

  // Yeni mesaj gönder
  send(): void {
    if (!this.newMessage.trim()) return;
    this.msgSvc.sendMessage(this.conversationId, this.newMessage).subscribe({
      next: msg => {
        this.messages.push(msg);
        this.newMessage = '';
        this.scrollToBottom();
      },
      error: err => console.error('[ChatWindow] Mesaj gönderilemedi:', err)
    });
  }

  // Mesaj kullanıcıya mı ait kontrolü
  isMine(message: Message): boolean {
    return message.senderId === this.auth.getUser()!._id;
  }

  // Mesaj alanını en alta kaydır
  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}