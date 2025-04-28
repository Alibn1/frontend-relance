import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpContextToken } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const SKIP_AUTH = new HttpContextToken(() => false);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 🎯 Ignore les requêtes publiques
  if (req.context.get(SKIP_AUTH) || req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  // ⚙️ Sécuriser l'accès au localStorage uniquement si on est dans le navigateur
  let token: string | null = null;
  if (isPlatformBrowser(platformId)) {
    token = authService.getToken();
  }

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned).pipe(
      catchError(err => {
        if (err.status === 401) {
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  } else {
    // ❗ Si pas de token, NE PAS faire de logout forcé ni d'erreur levée
    // Juste envoyer la requête telle quelle (par exemple pour pages publiques)
    return next(req);
  }
};
