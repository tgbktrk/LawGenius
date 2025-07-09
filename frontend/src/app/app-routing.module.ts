import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Genel Bileşenler
import { WelcomeComponent } from './components/welcome/welcome.component';
import { HomeComponent } from './components/home/home.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { ChatbotHistoryComponent } from './components/chatbot-history/chatbot-history.component';
import { LegaladviceComponent } from './components/legaladvice/legaladvice.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';

// Admin Paneli
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminGuard } from './guards/admin.guard';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { LawyerDetailComponent } from './components/lawyer-detail/lawyer-detail.component';

// Avukat Paneli
import { LawyerApplyComponent } from './components/lawyer-apply/lawyer-apply.component';

// Guard
import { AuthGuard } from './guards/auth.guard';
import { LawyerGuard } from './guards/lawyer.guard';
import { AutoRedirectComponent } from './components/auto-redirect/auto-redirect.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { ConversationListComponent } from './components/conversation-list/conversation-list.component';
import { PremiumComponent } from './components/premium/premium.component';
import { LawyerPendingListComponent } from './components/lawyer-pending-list/lawyer-pending-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'chatbot', component: ChatbotComponent },
  { path: 'chatbot/:id', component: ChatbotComponent },
  { path: 'chatbot/:model/:conversationId', component: ChatbotComponent, canActivate: [AuthGuard] },
  { path: 'chatbot-history', component: ChatbotHistoryComponent, canActivate: [AuthGuard] },
  { path: 'legal-advice', component: LegaladviceComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'lawyer-apply', component: LawyerApplyComponent },
  { path: 'redirect', component: AutoRedirectComponent },
// sohbet listesi
{ path: 'conversations', component: ConversationListComponent, canActivate: [AuthGuard] },
// tekli sohbet ekranı
{ path: 'conversation/:id', component: ChatWindowComponent, canActivate: [AuthGuard] },
  // Admin Routes
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'admin/user-detail/:id', component: UserDetailComponent, canActivate: [AdminGuard] },
  { path: 'admin/lawyer-detail/:id', component: LawyerDetailComponent, canActivate: [AdminGuard] },
  {
    path: 'admin/lawyer-pending',    // onay bekleyenler
    component: LawyerPendingListComponent,
    canActivate: [AdminGuard]
  },

  { 
    path: 'lawyer/conversations', 
    component: ConversationListComponent, 
    canActivate: [AuthGuard], 
    data: { role: 'lawyer' }        // isMine vs. role bazlı davranış ihtiyacı varsa
  },

  // Avukat için tekli sohbet ekranı
  { 
    path: 'lawyer/conversation/:id', 
    component: ChatWindowComponent, 
    canActivate: [AuthGuard], 
    data: { role: 'lawyer' }
  },

  // User paneli
  { 
    path: 'conversations', 
    component: ConversationListComponent, 
    canActivate: [AuthGuard] 
  },
  { path: 'conversation/:id', component: ChatWindowComponent, canActivate: [AuthGuard] },

  {
    path: 'premium',
    component: PremiumComponent,
    canActivate: [AuthGuard]  // kullanıcı giriş kontrolü varsa
  },
  // Not Found Route
  { path: '**', redirectTo: '/welcome' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}