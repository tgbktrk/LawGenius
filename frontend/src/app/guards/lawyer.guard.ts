import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class LawyerGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Token ve kullanıcı bilgisi alınır
    const token = localStorage.getItem('token');
    const user = this.authService.getUser();

    // Kullanıcı yoksa veya rolü lawyer değilse login sayfasına yönlendirilir
    if (!token || !user || user.role !== 'lawyer') {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      // Token süresi kontrol edilir
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        localStorage.clear();
        this.router.navigate(['/login']);
        return false;
      }
    } catch (e) {
      // Token geçersizse veya çözümleme hatası varsa login'e yönlendirilir
      console.error('Token çözümleme hatası:', e);
      this.router.navigate(['/login']);
      return false;
    }

    // Tüm kontroller geçildiyse erişime izin verilir
    return true;
  }
}