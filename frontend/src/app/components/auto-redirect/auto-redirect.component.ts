import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auto-redirect',
  standalone: false,
  templateUrl: './auto-redirect.component.html',
  styleUrl: './auto-redirect.component.scss'
})
export class AutoRedirectComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // LocalStorage’tan kullanıcı verisini çek
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
  
    // Kullanıcı yoksa login sayfasına yönlendir
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
  
    // 0 ms delay: Angular’un navigation lifecycle’ıyla çakışmamak için
    setTimeout(() => {
      // Rol bazlı yönlendirme
      if (user.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (user.role === 'lawyer') {
        this.router.navigate(['/lawyer/conversations']);
      } else if (user.role === 'user') {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/welcome']);
      }
    }, 0);
  }
}