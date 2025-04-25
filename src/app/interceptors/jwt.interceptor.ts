import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpContextToken } from '@angular/common/http';

// ⚙️ Définition d'un token de contexte personnalisé pour ignorer certaines requêtes
export const SKIP_AUTH = new HttpContextToken(() => false);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);  // Injection du service d'authentification
  const router = inject(Router);            // Injection du routeur

  // 🎯 Ignorer les requêtes où le contexte `SKIP_AUTH` est activé (ex: requêtes publiques ou non-authentifiées)
  if (req.context.get(SKIP_AUTH) || req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);  // Passe la requête sans modification
  }

  const token = authService.getToken();  // Récupère le token stocké dans localStorage (ou ailleurs)

  if (token) {
    // 👌 Si un token est présent, ajoute-le à l'en-tête de la requête
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`  // Injection du token dans l'en-tête Authorization
      }
    });
    return next(cloned).pipe(
      catchError(err => {
        // 🔴 Si le serveur renvoie une erreur 401 (non autorisé), se déconnecte et redirige
        if (err.status === 401) {
          authService.logout();   // Déconnexion de l'utilisateur
          router.navigate(['/login']);  // Redirection vers la page de login
        }
        return throwError(() => err);  // Relance l'erreur après traitement
      })
    );
  } else {
    // Si aucun token n'est présent, déconnecte l'utilisateur et redirige
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => new Error('No authentication token available'));
  }
};
