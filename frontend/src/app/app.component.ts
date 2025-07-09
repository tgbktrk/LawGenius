import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isWelcomePage = false;
  isAdminPage   = false;
  isLawyerPage  = false;
  isUserPage    = false;

  isAdmin  = false;
  isLawyer = false;
  isUser   = false;

  constructor(
    private router: Router,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('tr');
    this.translate.use('tr');

    this.router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) return;

      const url  = event.urlAfterRedirects;
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const role = user?.role;

      // 1) Karşılama (“welcome”) sayfası
      this.isWelcomePage = url === '/welcome';

      // 2) “Admin pages”:
      //    • /admin/*
      //    • /lawyer/* rotaları (liste, detay, pending) — yalnızca admin rolündeyse
      const isLawyerRoute = url.startsWith('/lawyer');
      this.isAdminPage =
        url.startsWith('/admin') ||
        (role === 'admin' && isLawyerRoute);

      // 3) “Lawyer dashboard” rotaları:
      //    • /lawyer/* rotaları — yalnızca lawyer rolündeyse
      //    • ancak /lawyer/apply (başvuru formu) hariç
      this.isLawyerPage =
        role === 'lawyer' &&
        isLawyerRoute &&
        url !== '/lawyer/apply';

      // 4) Geri kalan tüm sayfalar “user/public” navbar’ı
      this.isUserPage =
        !this.isWelcomePage &&
        !this.isAdminPage &&
        !this.isLawyerPage;

      // Roller
      this.isAdmin  = role === 'admin';
      this.isLawyer = role === 'lawyer';
      this.isUser   = role === 'user';
    });
  }
}