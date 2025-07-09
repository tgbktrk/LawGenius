import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiBaseUrl}/api/users`;

  constructor(private http: HttpClient) {}

  // Tüm kullanıcıları getirir
  getAllUsers(): Observable<any[]> {
    const token = localStorage.getItem('token')!;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any[]>(this.baseUrl, { headers });
  }

  // Belirli bir kullanıcıyı siler
  deleteUser(userId: string) {
    const token = localStorage.getItem('token')!;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.delete(`${this.baseUrl}/${userId}`, { headers });
  }

  // Belirli bir kullanıcıyı id ile getirir
  getUserById(userId: string): Observable<any> {
    const token = localStorage.getItem('token')!;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(`${this.baseUrl}/${userId}`, { headers });
  }

  // Oturum açmış kullanıcının bilgilerini günceller
  updateUser(updatedUser: any): Observable<any> {
    const token = localStorage.getItem('token')!;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<any>(`${this.baseUrl}/me`, updatedUser, { headers });
  }
}