import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Router} from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ne pas intercepter les requêtes vers /login ou /register
  if (req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  const token = authService.getToken();

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
    // Si pas de token, rediriger vers login
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => new Error('No authentication token available'));
  }
};
