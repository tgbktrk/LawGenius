// Şifre Sıfırlama Bileşeni
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  // Form alanları
  email = '';
  newPassword = '';
  confirmPassword = '';

  // Durum değişkenleri
  emailVerified = false;
  errorMessage = '';
  successMessage = '';

  // Şifre görünürlüğü
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  // E-posta kontrolü yapılır
  onEmailSubmit() {
    this.clearMessages();

    // E-posta alanı boşsa hata göster
    if (!this.email) {
      this.errorMessage = this.translate.instant('forgot_password.errors.fill_all_fields');
      return;
    }

    // E-posta sistemde kayıtlı mı kontrol et
    this.authService.checkEmail(this.email).subscribe({
      next: () => {
        this.emailVerified = true;
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage = this.translate.instant('forgot_password.errors.email_not_found');
        } else {
          this.errorMessage = this.translate.instant('forgot_password.errors.server');
        }
      }
    });
  }

  // Yeni şifre gönderimi yapılır
  onPasswordReset() {
    this.clearMessages();

    // Alanlar boşsa hata göster
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = this.translate.instant('forgot_password.errors.fill_all_fields');
      return;
    }

    // Şifreler eşleşmiyorsa hata göster
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = this.translate.instant('forgot_password.errors.passwords_not_match');
      return;
    }

    // Şifre güncelleme servisini çağır
    this.authService.resetPassword(this.email, this.newPassword).subscribe({
      next: () => {
        this.successMessage = this.translate.instant('forgot_password.success.reset_success');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage = this.translate.instant('forgot_password.errors.email_not_found');
        } else if (err.status === 400 && err.error.message === 'same_as_old_password') {
          this.errorMessage = this.translate.instant('forgot_password.errors.same_as_old_password');
        } else {
          this.errorMessage = this.translate.instant('forgot_password.errors.reset_failed');
        }
      }
    });
  }

  // Hata ve başarı mesajlarını temizle
  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Yeni şifre alanının görünürlüğünü değiştir
  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  // Onay şifresi alanının görünürlüğünü değiştir
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Giriş sayfasına yönlendir
  backToLogin() {
    this.router.navigate(['/login']);
  }
}