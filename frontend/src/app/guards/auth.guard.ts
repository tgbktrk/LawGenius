import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { AlertMessageService } from '../services/alert-message.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private alertMessageService: AlertMessageService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Token yoksa kullanıcıyı login sayfasına yönlendir
    const token = localStorage.getItem('token');
  
    if (!token) {
      this.alertMessageService.setMessage('Bu sayfaya erişmek için giriş yapmalısınız.');
      this.router.navigate(['/login']);
      return false;
    }
  
    try {
      // Token varsa süresi dolmuş mu kontrol et
      const decoded: any = jwtDecode(token);
      const now = Date.now().valueOf() / 1000;
      if (decoded.exp < now) {
        // Token süresi dolmuşsa oturumu temizle ve login'e yönlendir
        localStorage.clear();
        this.router.navigate(['/login'], {
          state: { message: 'Oturum süreniz doldu, lütfen tekrar giriş yapın.' }
        });
        return false;
      }

      // Geçerli token varsa erişime izin ver
      return true;
    } catch (err) {
      // Token geçersizse oturumu temizle ve login'e yönlendir
      localStorage.clear();
      this.router.navigate(['/login'], {
        state: { message: 'Geçersiz oturum bilgisi.' }
      });
      return false;
    }
  }
}