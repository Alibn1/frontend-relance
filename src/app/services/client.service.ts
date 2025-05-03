import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({Authorization: `Bearer ${token}`}) : new HttpHeaders();
    return {headers};
  }

  getClients(params?: any): Observable<any> {
    const httpParams = params ? new HttpParams({fromObject: params}) : undefined;
    return this.http.get<any>(`${this.apiUrl}/clients`, {...this.getAuthHeaders(), params: httpParams});
  }


  getClientDetails(code: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients/${code}`);
  }

  getClientById(clientId: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/clients/${clientId}`, this.getAuthHeaders());
  }

  getClientRelances(clientId: string, params?: any): Observable<any> {
    const httpParams = params ? new HttpParams({fromObject: params}) : undefined;
    return this.http.get<any>(`${this.apiUrl}/clients/${clientId}/relances`, {
      ...this.getAuthHeaders(),
      params: httpParams
    });
  }

  getClientReleves(clientId: string, params: any = {}): Observable<any> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<any>(`${this.apiUrl}/clients/${clientId}/releves`, {
      ...this.getAuthHeaders(),
      params: httpParams
    });
  }
}

