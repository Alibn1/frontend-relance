import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment'; // ✅

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authResolvedSubject = new BehaviorSubject<boolean>(false); // ✅ Nouveau observable pour le spinner
  public isAuthResolved$ = this.authResolvedSubject.asObservable();


  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeUser();
  }

  private initializeUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('currentUser');

      if (token) {
        if (!localStorage.getItem('currentUser')) {
          this.getProfile().subscribe({
            next: (user) => {
              const userData = { ...user, token };
              localStorage.setItem('currentUser', JSON.stringify(userData));
              this.currentUserSubject.next(userData);
              this.authResolvedSubject.next(true); // résolu ici
            },
            error: () => {
              this.clearStorage();
              this.authResolvedSubject.next(true); // même en cas d’erreur
            }
          });
        } else {
          try {
            const userData = JSON.parse(localStorage.getItem('currentUser')!);
            if (userData && userData.token === token) {
              this.currentUserSubject.next(userData);
            } else {
              this.clearStorage();
            }
          } catch (e) {
            this.clearStorage();
          }
          this.authResolvedSubject.next(true); // résolu ici aussi
        }
      } else {
        this.authResolvedSubject.next(true); // aucun token mais état résolu
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap({
        next: (response) => this.handleLoginSuccess(response),
        error: (error) => this.handleAuthError(error)
      })
    );
  }

  register(userData: { name: string; email: string; password: string }): Observable<any> {
    const registrationData = { ...userData, role: 'agent' };
    return this.http.post(`${this.apiUrl}/register`, registrationData);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.authResolvedSubject.next(true); // ✅ Résolu même après logout
    this.router.navigate(['/login']);
  }

  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return this.currentUserValue?.token || localStorage.getItem('access_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  handleLoginSuccess(response: any): void {
    const userData = { ...response.user, token: response.access_token };
    this.saveSession(response.access_token, userData);
    this.currentUserSubject.next(userData);
    this.isAuthenticatedSubject.next(true);
    this.authResolvedSubject.next(true); // ✅ Résolu après login réussi
  }

  private handleAuthError(error: any): void {
    this.clearStorage();
    console.error('Authentication error:', error);
    this.authResolvedSubject.next(true); // ✅ Même en cas d'erreur
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('access_token');
    }
  }

  saveSession(token: string, user: any): void {
    if (this.isBrowser()) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
