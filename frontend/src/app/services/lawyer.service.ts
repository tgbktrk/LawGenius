import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Lawyer } from '../models/lawyer.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LawyerService {
  private apiUrl = `${environment.apiBaseUrl}/api/lawyers`;

  constructor(private http: HttpClient) {}

  // Yetkili istekler için header oluşturur
  private authHeaders() {
    const token = localStorage.getItem('token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  // Avukat kaydı oluşturur
  registerLawyer(data: any) {
    return this.http.post(
      `${this.apiUrl}/register`,
      data,
      this.authHeaders()
    );
  }

  // Onay bekleyen avukatları getirir
  getPendingLawyers() {
    return this.http.get(
      `${this.apiUrl}/pending`,
      this.authHeaders()
    );
  }

  // Avukatı onaylar
  approveLawyer(lawyerId: string) {
    return this.http.patch(
      `${this.apiUrl}/approve/${lawyerId}`,
      {},
      this.authHeaders()
    );
  }

  // Avukatı reddeder
  rejectLawyer(lawyerId: string) {
    return this.http.delete(
      `${this.apiUrl}/reject/${lawyerId}`,
      this.authHeaders()
    );
  }

  // Onaylanmış tüm avukatları getirir
  getApprovedLawyers() {
    return this.http.get(
      `${this.apiUrl}/approved`,
      this.authHeaders()
    );
  }

  // Avukatı id ile getirir
  getLawyerById(id: string) {
    return this.http.get<Lawyer>(
      `${this.apiUrl}/${id}`,
      this.authHeaders()
    );
  }

  // Kullanıcılar için onaylı avukatları getirir
  getLawyersForUsers() {
    return this.http.get<Lawyer[]>(
      `${this.apiUrl}/approved-public`,
      this.authHeaders()
    );
  }

  // Giriş yapan avukatın profilini getirir
  getLawyerProfile(): Observable<Lawyer> {
    return this.http.get<Lawyer>(
      `${this.apiUrl}/me`,
      this.authHeaders()
    );
  }

  // Avukatı siler
  deleteLawyer(id: string) {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      this.authHeaders()
    );
  }

  // Avukat bilgilerini günceller
  updateLawyer(updatedLawyer: Partial<Lawyer>): Observable<Lawyer> {
    return this.http.put<Lawyer>(
      `${this.apiUrl}/me`,
      updatedLawyer,
      this.authHeaders()
    );
  }
}