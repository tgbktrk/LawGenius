import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-premium',
  standalone: false,
  templateUrl: './premium.component.html',
  styleUrl: './premium.component.scss'
})
// Premium üyelik sayfası bileşeni
export class PremiumComponent {
  // Butonun loading durumunu kontrol eden bayrak
  loading = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private router: Router
  ) {}

  // Kullanıcıyı premium yapma işlemi
  becomePremium() {
    this.loading = true;
    
    this.authService.upgradeToPremium().subscribe({
      // Başarılı yanıt alındığında:
      next: () => {
        this.toastr.success(
          this.translate.instant('premium.success'),
          this.translate.instant('toast.success')
        );
        this.router.navigate(['/home']);
      },

      // Hata oluştuğunda:
      error: () => {
        this.toastr.error(
          this.translate.instant('premium.failure'),
          this.translate.instant('toast.error')
        );
      }
    }).add(() => this.loading = false); // Her durumda loading'i kapat
  }
}