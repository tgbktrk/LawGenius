import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent {
  // Görüntülenecek kullanıcı verisi
  user: any;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // URL parametresinden kullanıcı ID'sini al
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Kullanıcı bilgilerini sunucudan çek
      this.userService.getUserById(id).subscribe({
        next: (data) => this.user = data,
        error: (err) => {
          console.error('Kullanıcı alınamadı:', err);
          alert('Kullanıcı verisi alınamadı.');
        }
      });
    }
  }

  // Kullanıcıyı silme işlemi
  deleteUser() {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      this.userService.deleteUser(this.user._id).subscribe({
        next: () => {
          alert('Kullanıcı silindi.');
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err) => {
          console.error('Silme hatası:', err);
          alert('Silme işlemi başarısız.');
        }
      });
    }
  }
}