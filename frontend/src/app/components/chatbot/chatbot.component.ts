import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { TranslateService } from '@ngx-translate/core';
import { ConversationService } from '../../services/conversation.service';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';

// Chatbot sistem kullanıcısının sabit ID'si
const BOT_ID = '000000000000000000000000';

// Ülke ve gönderici rolü türleri
type CountryCode = 'TR' | 'US';
type SenderRole = 'User' | 'Lawyer' | 'Chatbot';

@Component({
  selector: 'app-chatbot',
  standalone: false,
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatBox') chatBox!: ElementRef;

  // Kullanıcının seçebileceği model opsiyonları
  modelOptions = ['OpenAI','MistralAI'] as const;
  selectedModel: typeof this.modelOptions[number] = 'OpenAI';

  // Seçilen ülke kodu (default: TR)
  selectedCountry: CountryCode = 'TR';

  // Sohbet mesajları listesi
  messages: { sender: 'user'|'bot'; text: string }[] = [];

  // Kullanıcının yazdığı mesaj
  userInput = '';

  // Modelden cevap bekleniyor mu
  isLoading = false;

  // Giriş durumu, kullanıcı ID ve aktif sohbet ID'si
  isLoggedIn = false;
  conversationId = '';
  currentUserId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private translate: TranslateService,
    private auth: AuthService,
    private convService: ConversationService,
    private msgService: MessageService
  ) {}

  ngOnInit(): void {
    // Giriş yapmış kullanıcı bilgisi alınır
    this.currentUserId = this.auth.userId;
    this.isLoggedIn = !!this.currentUserId;

    // URL'de önceki sohbet varsa mesajlar yüklenir
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id') ?? '';
      this.conversationId = id;

      if (this.isLoggedIn && id) {
        this.loadMessages();
      } else {
        this.messages = [];
        this.updateBotGreeting();
      }
    });

    // Dil değiştiğinde selamlama güncellenir (yeni sohbette)
    this.translate.onLangChange.subscribe(() => {
      if (!this.conversationId) this.updateBotGreeting();
    });
  }

  // Botun selamlama mesajını günceller
  updateBotGreeting(): void {
    // Önceki bot mesajları temizlenir
    this.messages = this.messages.filter(m => m.sender !== 'bot');

    // Eğer desteklenmeyen ülkeyse uyarı ver
    if (this.selectedCountry === 'US') {
      this.translate.get('chat.unsupported_country_message')
        .subscribe(msg => this.messages.push({ sender: 'bot', text: msg }));
      this.translate.get('chat.unsupported_country_placeholder')
        .subscribe(ph  => this.userInput = ph);
      return;
    }

    // Selamlama mesajı eklenir
    this.translate.get(`chat.greeting.${this.selectedCountry}`)
      .subscribe(greeting => {
        this.messages.push({ sender: 'bot', text: greeting });
        this.scrollToBottom();
      });

    this.userInput = '';
  }

  // Kullanıcı mesajını gönderir ve yanıt alır
  sendMessage(): void {
    if (!this.userInput.trim() || this.selectedCountry === 'US') return;

    const text = this.userInput.trim();
    this.userInput = '';
    this.messages.push({ sender: 'user', text });
    this.scrollToBottom();

    const modelKey: 'OpenAI' | 'MistralAI' = this.selectedModel;
    const modelForChat = modelKey === 'OpenAI' ? 'openai' : 'mistralai';

    // Veritabanına mesaj kaydetme yardımcı fonksiyonu
    const saveToDb = (
      convId: string,
      content: string,
      senderRole: SenderRole
    ) => {
      this.msgService
        .sendMessage(convId, content, modelKey, senderRole)
        .subscribe({ error: err => console.error('DB kaydı hatası:', err) });
    };

    // Eğer giriş yapılmışsa
    if (this.isLoggedIn) {
      const rawRole = this.auth.getUser()!.role.toLowerCase();
      const actorRole: SenderRole = rawRole === 'lawyer' ? 'Lawyer' : 'User';

      // Eğer ilk mesajsa yeni konuşma oluştur
      if (!this.conversationId) {
        this.convService
          .createConversation(
            [
              { userId: this.currentUserId, role: actorRole },
              { userId: BOT_ID, role: 'Chatbot' }
            ],
            actorRole === 'Lawyer' ? 'lawyer-chatbot' : 'user-chatbot'
          )
          .subscribe(
            conv => {
              this.conversationId = conv._id;
              saveToDb(conv._id, text, actorRole);
            },
            err => console.error('Yeni sohbet açılamadı:', err)
          );
      } else {
        saveToDb(this.conversationId, text, actorRole);
      }
    }

    // API üzerinden yanıt al
    this.isLoading = true;
    this.chatService
      .askQuestion(text, this.selectedCountry, modelForChat, this.conversationId)
      .subscribe({
        next: res => {
          this.isLoading = false;
          if (!this.conversationId && res.conversationId) {
            this.conversationId = res.conversationId!;
          }
          this.messages.push({ sender: 'bot', text: res.reply });
          this.scrollToBottom();
          if (this.isLoggedIn && this.conversationId) {
            saveToDb(this.conversationId, res.reply, 'Chatbot');
          }
        },
        error: err => {
          this.isLoading = false;
          const errMsg = err.message;
          this.messages.push({ sender: 'bot', text: errMsg });
          this.scrollToBottom();
          if (this.isLoggedIn && this.conversationId) {
            saveToDb(this.conversationId, errMsg, 'Chatbot');
          }
        }
      });
  }

  // Daha önceki mesajları yükler
  private loadMessages(): void {
    if (!this.conversationId) return;

    this.msgService.getMessages(this.conversationId).subscribe({
      next: msgs => {
        this.messages = [];
        msgs.forEach(m => {
          const isBot = m.senderRole.toLowerCase() === 'chatbot';
          this.messages.push({
            sender: isBot ? 'bot' : 'user',
            text: m.content
          });
        });
        this.scrollToBottom();
      },
      error: err => console.error('Mesaj yükleme hatası:', err)
    });
  }

  // Scroll'u en alta kaydırır
  private scrollToBottom(): void {
    try {
      this.chatBox.nativeElement.scrollTop =
        this.chatBox.nativeElement.scrollHeight;
    } catch {}
  }

  // Bileşen güncellendiğinde otomatik scroll
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
}