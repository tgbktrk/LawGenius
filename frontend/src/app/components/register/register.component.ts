import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  // Kayıt formu için kullanıcıdan alınacak veriler
  registerData = { 
    name: '',
    email: '',
    password: '',
    phone: '',
    birthDate: '',
    gender: '' 
  };

  // Hata mesajlarını göstermek için
  errorMessage = '';

  // Şifreyi göster/gizle butonu için
  showPassword = false;

  // Bugünün tarihi (doğum tarihi için min/max kontrolü yapılabilir)
  today = new Date().toISOString().split('T')[0];
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Kayıt işlemini başlatır
  onRegister() {
    this.errorMessage = '';

    // Yeni kullanıcıyı kayıt et
    this.authService.register(this.registerData).subscribe(
      () => {
        // Kayıt başarılıysa otomatik giriş yap
        this.authService.login(this.registerData.email, this.registerData.password).subscribe(() => {
          this.router.navigate(['/home']);
        });
      },
      // Hata durumunda kullanıcıyı bilgilendir
      error => {
        if (error?.error?.message === 'Email already registered') {
          this.errorMessage = 'form.error.email_already_exists';
        } else {
          this.errorMessage = 'login.errors.server';
        }
      }
    );
  }

  // Şifrenin görünürlüğünü değiştir
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Giriş sayfasına yönlendir
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}