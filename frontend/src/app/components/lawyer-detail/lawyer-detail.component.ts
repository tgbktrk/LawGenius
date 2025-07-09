import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LawyerService } from '../../services/lawyer.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-lawyer-detail',
  standalone: false,
  templateUrl: './lawyer-detail.component.html',
  styleUrls: ['./lawyer-detail.component.scss']
})
export class LawyerDetailComponent implements OnInit {
  lawyer: any;
  isPending = false;

  constructor(
    private route: ActivatedRoute,
    private lawyerService: LawyerService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  // Bileşen yüklendiğinde avukat detayını getir
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.lawyerService.getLawyerById(id).subscribe({
        next: (data: any) => {
          // Günler string olarak gelmişse parse et
          if (Array.isArray(data.availableDays) && typeof data.availableDays[0] === 'string' && data.availableDays[0].startsWith('[')) {
            try {
              data.availableDays = JSON.parse(data.availableDays[0]);
            } catch (e) {
              console.error('availableDays parse hatası:', e);
            }
          }

          // Diller string olarak gelmişse parse et
          if (typeof data.languages === 'string' && data.languages.startsWith('[')) {
            try {
              data.languages = JSON.parse(data.languages);
            } catch (e) {
              console.error('languages parse hatası:', e);
            }
          }

          this.lawyer = data;
          this.isPending = !data.isApproved;
        },
        error: (err) => {
          console.error('Lawyer detay çekme hatası:', err);
          alert('Avukat verisi alınamadı: ' + err.message);
        }
      });
    }
  }

  // Dosya yolu tam URL’ye çevrilir
  getFullDocumentUrl(relativePath: string): string {
    return `http://localhost:3000/${relativePath}`;
  }

  // Admin: Başvuru onayla
  approve(id: string) {
    this.lawyerService.approveLawyer(id).subscribe({
      next: () => {
        alert('Başvuru onaylandı');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        console.error('Onay hatası:', err);
        alert('Onay sırasında hata oluştu.');
      }
    });
  }

  // Admin: Başvuruyu reddet
  reject(id: string) {
    this.lawyerService.rejectLawyer(id).subscribe({
      next: () => {
        alert('Başvuru reddedildi');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        console.error('Red hatası:', err);
        alert('Red işlemi sırasında hata oluştu.');
      }
    });
  }

  // Admin: Avukatı sil
  delete(id: string) {
    const confirmed = confirm('Bu avukatı silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    this.lawyerService.deleteLawyer(id).subscribe({
      next: () => {
        alert('Avukat silindi.');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        console.error('Silme hatası:', err);
        alert('Silme işlemi sırasında hata oluştu.');
      }
    });
  }
}