import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { AuthService } from '../services/auth.service';
import {Observable, of} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private isCheckingAuth = true;

  constructor(private authService: AuthService, private router: Router) {
    // Initial check
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.isCheckingAuth = false;
      }
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authService.isAuthResolved$.pipe(
      take(1),
      switchMap((isResolved) => {
        if (!isResolved) return of(false); // Ne pas activer tant que pas prêt

        return this.authService.currentUser$.pipe(
          take(1),
          map(user => {
            if (user) {
              return true;
            } else {
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
