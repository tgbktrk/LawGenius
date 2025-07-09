import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

interface ApiResponse {
  reply: string;
  fallback?: boolean;
  error?: string;
  conversationId?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = `${environment.apiBaseUrl}/api/ask`;

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  askQuestion(
    question: string,
    country: string,
    model: 'openai' | 'mistralai',
    conversationId?: string
  ): Observable<ApiResponse> {
    const body: any = { question, country, model };
    if (conversationId) body.conversationId = conversationId;

    return this.http.post<ApiResponse>(this.apiUrl, body).pipe(
      catchError((err: HttpErrorResponse) => {
        // Ağ-dışı veya sunucu 5xx
        if (err.status === 0 || err.status >= 500) {
          return throwError(() =>
            new Error(this.translate.instant('chat.errors.server_unreachable'))
          );
        }

        // Kota aşımı
        if (err.status === 429) {
          return throwError(() =>
            new Error(this.translate.instant('chat.errors.limit_exhausted'))
          );
        }

        // Backend’in dönüştüğü error key’ini çıkaralım
        let key = 'chat.errors.generic';
        if (typeof err.error === 'string') {
          key = err.error;
        } else if (err.error && typeof err.error.error === 'string') {
          key = err.error.error;
        }

        // Sadece gerçekten login_required ise o mesajı ver (openai için)
        if (key === 'chat.errors.login_required') {
          return throwError(() =>
            new Error(this.translate.instant('chat.errors.login_required'))
          );
        }

        // Hukuki değilse veya diğer 403’ler (only_legal vb.)
        if (err.status === 403) {
          return throwError(() =>
            new Error(this.translate.instant(key))
          );
        }

        // Geri kalan tüm durumlar
        return throwError(() =>
          new Error(this.translate.instant(key))
        );
      })
    );
  }
}