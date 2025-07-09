import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // ✅ EKLENDİ

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LegaladviceComponent } from './components/legaladvice/legaladvice.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { LawyerPendingListComponent } from './components/lawyer-pending-list/lawyer-pending-list.component';
import { LawyerListComponent } from './components/lawyer-list/lawyer-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { LawyerDetailComponent } from './components/lawyer-detail/lawyer-detail.component';
import { LawyerApplyComponent } from './components/lawyer-apply/lawyer-apply.component';
import { ChatbotHistoryComponent } from './components/chatbot-history/chatbot-history.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AutoRedirectComponent } from './components/auto-redirect/auto-redirect.component';
import { ConversationListComponent } from './components/conversation-list/conversation-list.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { PremiumComponent } from './components/premium/premium.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChatbotComponent,
    NavbarComponent,
    FooterComponent,
    LegaladviceComponent,
    LoginComponent,
    RegisterComponent,
    WelcomeComponent,
    ProfileComponent,
    ForgotPasswordComponent,
    AdminDashboardComponent,
    LawyerPendingListComponent,
    LawyerListComponent,
    UserListComponent,
    LawyerDetailComponent,
    LawyerApplyComponent,
    ChatbotHistoryComponent,
    UserDetailComponent,
    AutoRedirectComponent,
    ConversationListComponent,
    ChatWindowComponent,
    PremiumComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,    
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      preventDuplicates: true
    }),
    TranslateModule.forRoot({
      defaultLanguage: 'tr',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }