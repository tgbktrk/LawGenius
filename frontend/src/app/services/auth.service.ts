import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { AppUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth';

  // Uygulamada oturum açmış kullanıcının bilgisi
  currentUser = new BehaviorSubject<AppUser | null>(null);

  constructor(private http: HttpClient) {
    // Uygulama açıldığında daha önceki oturumu yükle
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        this.currentUser.next(JSON.parse(stored));
      } catch {
        console.error('Kullanıcı verisi parse edilemedi');
      }
    }
  }

  // Uygulamada oturum açmış kullanıcının ID'si
  get userId(): string {
    // Öncelikle BehaviorSubject'ten dene
    const u = this.currentUser.value;
    if (u && u._id) {
      return u._id;
    }
    // Fallback olarak localStorage'daki 'user' objesini oku
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed: AppUser = JSON.parse(stored);
        return parsed._id;
      } catch {
        console.error('Kullanıcı verisi parse edilemedi');
        return '';
      }
    }
    return '';
  }

  // Geçerli kullanıcı bilgisi
  getUser(): AppUser | null {
    return this.currentUser.value;
  }

  // Kullanıcı bilgisi güncelleme
  setUser(u: AppUser) {
    this.currentUser.next(u);
    localStorage.setItem('user', JSON.stringify(u));
  }

  // Oturum açma metodu
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        // Token ve user’ı sakla
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        // Opsiyonel olarak userId’yi de ayrı sakla
        localStorage.setItem('userId', res.user._id);

        // BehaviorSubject’i güncelle
        this.currentUser.next(res.user);
      })
    );
  }

  // Kayıt olma metodu
  register(user: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    gender: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, user).pipe(
      tap(res => {
        if (res.token && res.user) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUser.next(res.user);
        }
      })
    );
  }

  // Şifre unuttum
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/forgot-password`, { email });
  }

  // E-posta kontrol
  checkEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/check-email`, { email });
  }

  // Şifre sıfırlama
  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reset-password`, { email, newPassword });
  }

  // Oturumu kapatma
  logout(): void {
    localStorage.clear();
    this.currentUser.next(null);
  }

  // Oturum kontrol
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token') && !!this.userId;
  }

  // Token getir
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Kendi hesabını silme
  deleteOwnAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/me`);
  }

  // Premium üyeliğe geçiş
  upgradeToPremium(): Observable<{ message: string; isPremium: boolean }> {
    return this.http
      .put<{ message: string; isPremium: boolean }>(
        `${this.baseUrl}/me/upgrade`,
        {}
      )
      .pipe(
        tap(res => {
          const user = this.currentUser.value;
          if (user) {
            const updated = { ...user, isPremium: res.isPremium };
            this.currentUser.next(updated);
            localStorage.setItem('user', JSON.stringify(updated));
          }
        })
      );
  }
}