import { Component, OnInit } from '@angular/core';
import { LawyerService } from '../../services/lawyer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lawyer-pending-list',
  standalone: false,
  templateUrl: './lawyer-pending-list.component.html',
  styleUrl: './lawyer-pending-list.component.scss'
})
export class LawyerPendingListComponent implements OnInit {
  // Onay bekleyen avukatların listesi
  pendingLawyers: any[] = [];

  constructor(private lawyerService: LawyerService, private router: Router) {}

  // Bileşen yüklendiğinde onay bekleyen avukatları getir
  ngOnInit(): void {
    this.fetchPending();
  }

  // API'den onay bekleyen avukatları çek
  fetchPending() {
    this.lawyerService.getPendingLawyers().subscribe({
      next: (data: any) => this.pendingLawyers = data,
      error: err => console.error(err)
    });
  }

  // Avukatı onayla ve listeden çıkar
  approve(id: string) {
    this.lawyerService.approveLawyer(id).subscribe(() => {
      this.pendingLawyers = this.pendingLawyers.filter(l => l._id !== id);
    });
  }

  // Avukatı reddet ve listeden çıkar
  reject(id: string) {
    this.lawyerService.rejectLawyer(id).subscribe(() => {
      this.pendingLawyers = this.pendingLawyers.filter(l => l._id !== id);
    });
  }

  // Avukat detay sayfasına yönlendir
  goToDetail(lawyer: any) {
    this.router.navigate(['/admin/lawyer-detail', lawyer._id]);
  }
}