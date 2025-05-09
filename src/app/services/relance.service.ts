import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';// <-- importe le bon fichier

@Injectable({
  providedIn: 'root'
})
export class RelanceService {
  private readonly API_URL = environment.apiUrl; // <-- propre et dynamique

  constructor(private http: HttpClient, private apiService: ApiService) { }

  getAllRelances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/relance-dossiers`);
  }

  getRelancesByClient(codeClient: string): Observable<any> {
    return this.apiService.get(`clients/${codeClient}/relances`).pipe(
      catchError(error => {
        console.error('Erreur getRelancesByClient:', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Créer un dossier de relance pour un client
  createRelance(clientCode: string): Observable<any> {
    const relanceData = {
      code_client: clientCode,
      date_relance_dossier: new Date().toISOString().split('T')[0],
      utilisateur_creation: 'System'  // Tu peux remplacer par le vrai user si besoin
    };

    console.log('Création relance avec :', relanceData);

    return this.apiService.post('relance-dossiers', relanceData).pipe(
      catchError(error => {
        console.error('Erreur createRelance:', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Ajouter une étape à un dossier de relance
  addRelanceStep(ndr: string, etapeData: any): Observable<any> {
    const formattedData = {
      code_sous_modele: etapeData.code_sous_modele,
      titre_sous_modele: etapeData.titre_sous_modele,
      ordre: etapeData.ordre,
      statut_detail: etapeData.statut_detail|| 'BROUILLON',
      date_rappel: etapeData.date_rappel,
      nb_jours_rappel: etapeData.nb_jours_rappel,
      methode_envoi: etapeData.methode_envoi,
      objet_relance_1: etapeData.objet_relance_1 || null,
      objet_relance_2: etapeData.objet_relance_2 || null,
      utilisateur_creation: etapeData.user_envoi || 'System'
    };

    console.log('Ajout étape relance avec :', formattedData);

    return this.apiService.post(`relance-dossiers/${ndr}/etape-relances`, formattedData).pipe(
      catchError(error => {
        console.error('Erreur addRelanceStep:', error);
        return throwError(() => error);
      })
    );
  }


}
