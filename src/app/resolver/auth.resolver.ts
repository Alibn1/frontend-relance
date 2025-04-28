import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {catchError, Observable, of} from 'rxjs';
import { tap, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthResolver implements Resolve<any> {
  constructor(private authService: AuthService) {}

  resolve(): Observable<any> {

    return this.authService.currentUser$.pipe(
      tap(() => {}),
      first(),
      catchError(() => of(null)) // Si une erreur arrive, retourne null pour ne pas bloquer la route
    );
  }
}
