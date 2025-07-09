import { Component, OnInit } from '@angular/core';
import { LawyerService }      from '../../services/lawyer.service';
import { AuthService }        from '../../services/auth.service';
import { Router }             from '@angular/router';
import { ToastrService }      from 'ngx-toastr';
import { TranslateService }   from '@ngx-translate/core';
import { ConversationService }from '../../services/conversation.service';
import { Participant } from '../../models/participant.model';
import { Conversation } from '../../models/conversation.model';

@Component({
  selector: 'app-legaladvice',
  standalone: false,
  templateUrl: './legaladvice.component.html',
  styleUrl: './legaladvice.component.scss'
})
export class LegaladviceComponent implements OnInit {
  approvedLawyers: any[] = [];
  searchTerm = '';
  selectedExpertise = '';
  allExpertiseAreas: string[] = [];

  constructor(
    private lawyerService: LawyerService,
    private authService: AuthService,
    private router: Router,
    private conversationService: ConversationService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  // Sayfa yüklendiğinde kullanıcı giriş yapmamışsa uyarı verilir
  // ve avukatlar listesi çekilir
  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.warning(
        this.translate.instant('toast.login_required'),
        this.translate.instant('toast.warning'),
        { timeOut: 4000, positionClass: 'toast-top-center' }
      );
      this.router.navigate(['/login']);
      return;
    }

    this.lawyerService.getLawyersForUsers().subscribe({
      next: lawyers => {
        this.approvedLawyers = lawyers;
        const areas = new Set<string>();
        lawyers.forEach(l => l.expertiseAreas?.forEach((a: string) => areas.add(a)));
        this.allExpertiseAreas = Array.from(areas);
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('toast.lawyer_load_error'),
          this.translate.instant('toast.error')
        );
      }
    });
  }

  // Kullanıcının seçtiği bir avukat ile yeni bir konuşma başlatması
  startConversation(lawyer: any): void {
    const userId = this.authService.userId;
    if (!userId) {
      this.toastr.error(
        this.translate.instant('toast.user_not_found'),
        this.translate.instant('toast.error')
      );
      return;
    }

    const lawyerUserId: string = lawyer.userId?._id || lawyer._id;

    const participants: Participant[] = [
      { userId, role: 'User' },
      { userId: lawyerUserId, role: 'Lawyer' }
    ];

    this.conversationService.createConversation(
      participants,
      'user-lawyer'
    ).subscribe({
      next: (conv: Conversation) => {
        this.router.navigate(['/conversation', conv._id]);
      },
      error: err => {
        const serverMsg = err.error?.error 
          || this.translate.instant('toast.conversation_start_error');
        this.toastr.error(
          serverMsg,
          this.translate.instant('toast.error'),
          { timeOut: 4000, positionClass: 'toast-top-center' }
        );
      }
    });
  }

  // Arama ve uzmanlık alanına göre avukatları filtreler
  get filteredLawyers(): any[] {
    const term = this.searchTerm.toLowerCase();
    return this.approvedLawyers.filter(lawyer => {
      const inLocation =
        lawyer.location?.city.toLowerCase().includes(term) ||
        lawyer.location?.district.toLowerCase().includes(term);
      const inExpertise =
        !this.selectedExpertise ||
        lawyer.expertiseAreas.includes(this.selectedExpertise);
      return inLocation && inExpertise;
    });
  }
}