import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.includes('/api/ask')) {
      console.log('🛡️ [AuthInterceptor] /api/ask intercepted, token=', this.auth.getToken());
    }

    const token = this.auth.getToken();

    if (token) {
      // Authorization header eklemek için isteği klonluyoruz
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next.handle(authReq);
    }

    // Token yoksa orijinal isteği gönder
    return next.handle(req);
  }
}