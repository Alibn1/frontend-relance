import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les événements d'une étape de relance
   * @param ndr Numéro du dossier de relance (ex: REL25001)
   * @param ner Numéro d'étape de relance (ex: ETR25001)
   */
  getEvenementsByDossier(ndr: string): Observable<any> {
    const url = `${this.apiUrl}/relances/${ndr}/evenements`;
    return this.http.get(url).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des événements:', error);
        return throwError(() => error);
      })
    );
  }


  /**
   * Crée un nouvel événement pour une étape de relance
   * @param ndr Numéro du dossier de relance
   * @param ner Numéro d'étape de relance
   * @param data Données de l'événement à créer
   */
  createEvenement(ndr: string, ner: string, data: any): Observable<any> {
    const url = `${this.apiUrl}/relances/${ndr}/etapes/${ner}/evenements`;
    return this.http.post(url, data).pipe(
      catchError(error => {
        console.error('Erreur lors de la création de l\'événement :', error);
        throw error;
      })
    );
  }

  /**
   * Supprime un événement spécifique
   * @param ndr Numéro du dossier de relance
   * @param ner Numéro d'étape
   * @param id ID de l'événement
   */
  deleteEvenement(ndr: string, ner: string, id: number): Observable<any> {
    const url = `${this.apiUrl}/relances/${ndr}/etapes/${ner}/evenements/${id}`;
    return this.http.delete(url).pipe(
      catchError(error => {
        console.error('Erreur suppression événement :', error);
        throw error;
      })
    );
  }
}
