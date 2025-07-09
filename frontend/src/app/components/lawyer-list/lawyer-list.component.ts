import { Component, OnInit } from '@angular/core';
import { LawyerService } from '../../services/lawyer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lawyer-list',
  standalone: false,
  templateUrl: './lawyer-list.component.html',
  styleUrl: './lawyer-list.component.scss'
})
export class LawyerListComponent implements OnInit {
  // Onaylanmış avukatlar listesi
  lawyers: any[] = [];

  constructor(
    private lawyerService: LawyerService,
    private router: Router
  ) {}

  // Bileşen yüklendiğinde onaylı avukatları getir
  ngOnInit(): void {
    this.fetchApprovedLawyers();
  }

  // API'den onaylı avukatları al
  fetchApprovedLawyers() {
    this.lawyerService.getApprovedLawyers().subscribe({
      next: (data: any) => this.lawyers = data,
      error: err => console.error(err)
    });
  }

  // Detay sayfasına yönlendir
  goToDetail(id: string) {
    this.router.navigate(['/admin/lawyer-detail', id]);
  }
}