import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LawyerService } from '../../services/lawyer.service';
import { Lawyer, PopulatedUser } from '../../models/lawyer.model';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  // Giriş yapan kullanıcının temel bilgileri
  user: PopulatedUser = {
    _id:       '',
    name:      '',
    email:     '',
    phone:     '',
    birthDate: undefined,
    gender:    '',
    role:      ''
  };

  // Günün tarihi (formlarda maksimum tarih için kullanılabilir)
  today: string = new Date().toISOString().split('T')[0];

  // Eğer kullanıcı avukatsa, bu alanda avukat bilgileri tutulur
  lawyer: Lawyer | null = null;

  // Avukat başvurusu henüz onaylanmadıysa true olur
  approvalPending = false;

  // Uzmanlık alanlarının çevirilmiş hali
  translatedExpertiseAreas = '';

  // Profili düzenleme modu
  isEditing = false;

  // Düzenlenebilir kullanıcı bilgileri (form için)
  editableUser: PopulatedUser = { ...this.user };

  // Düzenlenebilir avukat bilgileri (form için)
  editableLawyer: Partial<Lawyer> = {};

  // Hesap silme işlemi için onay durumu
  showDeleteConfirm = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private lawyerService: LawyerService,
    private authService: AuthService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  // Bileşen ilk yüklendiğinde kullanıcı ve avukat bilgilerini getirir
  ngOnInit(): void {
    const current = this.authService.getUser();
    if (!this.authService.isLoggedIn() || !current) {
      this.toastr.warning(
        this.translate.instant('toast.login_required'),
        this.translate.instant('toast.warning'),
        { timeOut: 3000, positionClass: 'toast-top-center' }
      );
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    // Doğum tarihini string'e çevir (form için)
    const bdStr = current.birthDate
      ? new Date(current.birthDate).toISOString().split('T')[0]
      : undefined;

    this.user = {
      ...current,
      birthDate: bdStr as any
    };
    this.editableUser = { ...this.user };

    if (current.role === 'lawyer') {
      const cached = localStorage.getItem('lawyer');
      if (cached) {
        this.setLawyerAndUser(JSON.parse(cached));
      } else {
        this.fetchLawyerProfile();
      }
    }
  }

  // Eğer lawyer bilgisi localStorage'da yoksa, API'den getir
  private fetchLawyerProfile(): void {
    this.lawyerService.getLawyerProfile().subscribe({
      next: (lawyerData: Lawyer) => {
        if (!lawyerData.isApproved) {
          this.approvalPending = true;
          return;
        }
        // Uzmanlık alanlarını çevir
        const raw = lawyerData.expertiseAreas || [];
        this.translatedExpertiseAreas = raw
          .map(k => this.translate.instant(
            k.startsWith('law.expertise.') ? k : `law.expertise.${k}`
          ))
          .join(', ');
        localStorage.setItem('lawyer', JSON.stringify(lawyerData));
        this.setLawyerAndUser(lawyerData);
      },
      error: () => { /* sessiz geç */ }
    });
  }

  // Avukat bilgilerini ve kullanıcı bilgilerini birlikte ayarla
  private setLawyerAndUser(lawyerData: Lawyer): void {
    this.lawyer = lawyerData;
    const u = lawyerData.userId;
    const bdStr = u.birthDate
      ? new Date(u.birthDate).toISOString().split('T')[0]
      : undefined;
    this.user = {
      _id:       u._id,
      name:      u.name,
      email:     u.email,
      phone:     u.phone    || '',
      birthDate: bdStr as any,
      gender:    u.gender   || '',
      role:      u.role     || ''
    };
    this.editableUser = { ...this.user };
    this.editableLawyer = { ...lawyerData };
  }

  // Profili düzenleme modunu etkinleştir
  enableEdit(): void { this.isEditing = true; }

  // Düzenlemeyi iptal et ve önceki verilere geri dön
  cancelEdit(): void {
    this.isEditing = false;
    this.editableUser = { ...this.user };
    this.editableLawyer = this.lawyer ? { ...this.lawyer } : {};
  }

  // Formdaki değişiklikleri kaydet
  saveChanges(): void {
    const payload: PopulatedUser = {
      ...this.editableUser,
      birthDate: this.editableUser.birthDate
        ? new Date(this.editableUser.birthDate as any)
        : undefined
    };

    this.userService.updateUser(payload).subscribe({
      next: updatedUser => {
        const bdStr = updatedUser.birthDate
          ? new Date(updatedUser.birthDate).toISOString().split('T')[0]
          : undefined;

        this.user = { ...updatedUser, birthDate: bdStr as any };
        this.editableUser = { ...this.user };
        this.authService.setUser(this.user as any);

        this.toastr.success(this.translate.instant('toast.update_success'));

        if (this.user.role === 'lawyer') {
          this.lawyerService.updateLawyer(this.editableLawyer).subscribe({
            next: () => this.toastr.success(this.translate.instant('toast.update_success')),
            error: () => this.toastr.error(this.translate.instant('toast.update_failed'))
          });
        }

        this.isEditing = false;
      },
      error: () => this.toastr.error(this.translate.instant('toast.update_failed'))
    });
  }

  // Silme onay kutusunu göster
  onDeleteAccount(): void { this.showDeleteConfirm = true; }

  // Hesabı kalıcı olarak sil
  confirmDelete(): void {
    this.authService.deleteOwnAccount().subscribe({
      next: () => {
        this.logout();
      },
      error: () => {
        this.toastr.error(this.translate.instant('toast.delete_failed'));
      }
    });
  }

  // Silme işleminden vazgeç
  cancelDelete(): void { this.showDeleteConfirm = false; }

  // Kullanıcı çıkış yapar
  logout(): void {
    this.authService.logout();
    this.toastr.success(
      this.translate.instant('toast.logout_success'),
      this.translate.instant('toast.success'),
      { timeOut: 2000, positionClass: 'toast-top-center' }
    );
    this.router.navigate(['/login']);
  }
}