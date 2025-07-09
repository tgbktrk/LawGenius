import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Token veya kullanıcı yoksa veya rolü admin değilse login'e yönlendir
    const token = localStorage.getItem('token');
    const user = this.authService.getUser();

    if (!token || !user || user.role !== 'admin') {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      // Token süresi dolmuşsa logout yap ve login'e yönlendir
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        localStorage.clear();
        this.router.navigate(['/login']);
        return false;
      }
    } catch (e) {
      // Token parse edilemediyse login'e yönlendir
      console.error('Token doğrulanamadı:', e);
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}