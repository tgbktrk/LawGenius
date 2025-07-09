import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { LawyerService } from '../../services/lawyer.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Aktif sekmeyi takip eder: 'users', 'lawyers' veya 'pending'
  selectedTab: 'users' | 'lawyers' | 'pending' = 'pending';

  // Yüklenen kullanıcı, avukat ve bekleyen avukat listeleri
  users: any[] = [];
  lawyers: any[] = [];
  pendingLawyers: any[] = [];

  constructor(
    private userSvc: UserService,
    private lawyerSvc: LawyerService
  ) {}

  ngOnInit(): void {
    // İlk açılışta bekleyen avukatlar sekmesi gösterilir
    this.loadPending();
  }

  // Sekme değiştirildiğinde ilgili veriyi yükler
  selectTab(tab: 'users' | 'lawyers' | 'pending') {
    this.selectedTab = tab;
    if (tab === 'users') {
      this.loadUsers();
    } else if (tab === 'lawyers') {
      this.loadApproved();
    } else {
      this.loadPending();
    }
  }

  // Tüm kullanıcıları yükler (admin görünümü)
  private loadUsers() {
    this.userSvc.getAllUsers().subscribe({
      next: users => this.users = users,
      error: err => console.error('Kullanıcılar yüklenirken hata:', err)
    });
  }

  // Onaylanmış avukatları yükler
  private loadApproved() {
    this.lawyerSvc.getApprovedLawyers().subscribe({
      next: lawyers => this.lawyers = lawyers as any[],
      error: err => console.error('Onaylanmış avukatlar yüklenirken hata:', err)
    });
  }

  // Onay bekleyen avukatları yükler
  private loadPending() {
    this.lawyerSvc.getPendingLawyers().subscribe({
      next: pend => this.pendingLawyers = pend as any[],
      error: err => console.error('Bekleyen avukatlar yüklenirken hata:', err)
    });
  }
}