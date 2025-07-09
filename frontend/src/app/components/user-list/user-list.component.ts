import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  // Kullanıcı listesini tutan dizi
  users: any[] = [];

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Bileşen yüklendiğinde kullanıcıları getir
    this.loadUsers();
  }

  // Tüm kullanıcıları API'den çek
  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: users => {
        this.users = users;
      },
      error: err => {
        console.error('Kullanıcıları alırken hata:', err);
      }
    });
  }

  // Seçilen kullanıcının detay sayfasına yönlendir
  goToDetail(userId: string) {
    this.router.navigate(['/admin/user-detail', userId]);
  }
}