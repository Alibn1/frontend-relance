import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReleveService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return { headers };
  }

  // 🔽 Lister tous les relevés (optionnel)
  getAllReleves(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/releves`, this.getAuthHeaders());
  }

  // ✅ Créer un nouveau relevé
  createReleve(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/releves`, data, this.getAuthHeaders());
  }

  // ✏️ Modifier un relevé existant
  updateReleve(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/releves/${id}`, data, this.getAuthHeaders());
  }

  // ❌ Supprimer un relevé
  deleteReleve(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/releves/${id}`, this.getAuthHeaders());
  }

  // 🔄 Restaurer un relevé supprimé (si soft delete activé)
  restoreReleve(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/releves/${id}/restore`, {}, this.getAuthHeaders());
  }

  // 🗑️ Récupérer les relevés supprimés
  getTrashedReleves(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/releves/trashed`, this.getAuthHeaders());
  }
}
