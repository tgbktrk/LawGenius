import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppUser } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  // Dil ve kullanıcıya ait değişkenler
  selectedLang = 'tr';
  isMenuOpen = false;
  isLoggedIn = false;
  currentUser: AppUser | null = null;
  showAdminLinks = false;
  showLawyerLinks = false;

  constructor(
    private router: Router,
    private translate: TranslateService,
    public auth: AuthService
  ) {
    const savedLang = localStorage.getItem('lang') || 'tr';
    translate.addLangs(['en', 'tr']);
    translate.setDefaultLang(savedLang);
    this.selectedLang = savedLang;
    translate.use(savedLang);
  }

  // Kullanıcı oturumu ve rolüne göre linkleri ayarla
  ngOnInit(): void {
    this.auth.currentUser.subscribe(u => {
      this.currentUser = u;
      this.isLoggedIn = !!u;
      const role = u?.role || null;
      this.showAdminLinks = role === 'admin';
      this.showLawyerLinks = role === 'lawyer';
    });
  }

  // Sayfa yönlendirmesi yapar ve menüyü kapatır
  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.isMenuOpen = false;
  }

  // Uygulama dilini değiştirir ve localStorage'a kaydeder
  switchLang(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  // Mobil menü görünürlüğünü değiştirir
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Kullanıcı çıkış yapar ve giriş sayfasına yönlendirilir
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.isMenuOpen = false;
  }
}