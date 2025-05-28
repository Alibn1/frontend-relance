import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EtapeRelanceService {
  private apiUrl: any;

  constructor(private http: HttpClient) { }
  downloadPublicPDF(numero_relance: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/public/etape-relances/${numero_relance}/pdf`, {
      responseType: 'blob'
    });
  }


}
