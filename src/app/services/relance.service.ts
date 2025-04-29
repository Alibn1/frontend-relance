import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // <-- importe le bon fichier

@Injectable({
  providedIn: 'root'
})
export class RelanceService {
  private readonly API_URL = environment.apiUrl; // <-- propre et dynamique

  constructor(private http: HttpClient) {}

  getAllRelances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/relance-dossiers`);
  }
}
