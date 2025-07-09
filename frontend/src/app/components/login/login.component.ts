import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertMessageService } from '../../services/alert-message.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  // Kullanıcının giriş bilgileri
  email = '';
  password = '';
  showPassword = false;

  // Hata ve uyarı mesajları
  errorMessage = '';
  messageFromState: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private alertMessageService: AlertMessageService
  ) {}

  // Sayfa yüklendiğinde önceki sayfadan gelen uyarı varsa göster
  ngOnInit(): void {
    const message = this.alertMessageService.getMessage();
    if (message) {
      this.toastr.warning(message, 'Uyarı', {
        positionClass: 'toast-top-center',
        timeOut: 4000
      });
    }
  }

  // Giriş yap butonuna tıklandığında çalışır
  onLogin(): void {
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        const token = response.token;
        const user = response.user;
        const userId = user?._id || user?.id;

        // Başarılı giriş sonrası verileri sakla ve yönlendir
        if (token && userId) {
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId);
          localStorage.setItem('user', JSON.stringify(user));
          this.router.navigate(['/redirect']);
        } else {
          this.errorMessage = 'login.errors.missing_credentials';
        }
      },

      // Giriş başarısızsa hata mesajı ayarla
      error: (error) => {
        console.error('Login Hatası:', error);
        const msg = error?.error?.message;

        if (error.status === 403 && msg?.includes('onaylanmadı')) {
          this.errorMessage = 'login.errors.account_not_verified';
        } else if (msg === 'User not found') {
          this.errorMessage = 'login.errors.user_not_found';
        } else if (msg === 'Incorrect password') {
          this.errorMessage = 'login.errors.incorrect_password';
        } else {
          this.errorMessage = 'login.errors.server';
        }
      }
    });
  }

  // Şifreyi göster/gizle butonu
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // "Şifremi unuttum" sayfasına yönlendirme
  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  // "Kayıt ol" sayfasına yönlendirme
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}