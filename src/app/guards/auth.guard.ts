import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {

    return this.authService.isAuthResolved$.pipe(
      take(1), // Prend une seule valeur et se désabonne immédiatement après
      switchMap(isAuthResolved => {
        if (!isAuthResolved) {
          // Si l'état d'auth n'est pas encore résolu, on peut afficher un spinner ou attendre
          // Ici, on choisit simplement de rediriger vers login pour simplifier
          return of(this.router.createUrlTree(['/login']));
        }

        // Une fois que l'état d'authentification est résolu
        return this.authService.currentUser$.pipe(
          take(1),
          map(user => {
            if (user) {
              return true;  // Utilisateur connecté, accès autorisé
            } else {
              // Pas connecté, redirection intelligente vers login avec retour après connexion
              return this.router.createUrlTree(['/login'], {
                queryParams: { returnUrl: state.url }
              });
            }
          })
        );
      })
    );
  }
}
