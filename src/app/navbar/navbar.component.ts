import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import {MATERIAL_PROVIDERS} from '../material';
import {MatBadge} from '@angular/material/badge';
import {RelanceService} from '../services/relance.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,  // Correct pour mat-icon-button
    RouterLink,
    RouterOutlet,
    MATERIAL_PROVIDERS,
    MatBadge,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  nombreEtapes: number = 0;

  isAuthenticated: boolean = false;
  isMenuOpen: boolean = false; // true par défaut pour affichage desktop
  currentDateTime: string = '';

  constructor(protected authService: AuthService, private router: Router, private relanceService: RelanceService) { }

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe((status: boolean) => {
      this.isAuthenticated = status;
    });

    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000); // Mise à jour de la date et heure

    this.getNombreEtapes();
  }

  getNombreEtapes(): void {
    this.relanceService.getAllRelances().subscribe((relances: any[]) => {
      const etapes = relances
        .flatMap(r => r.etape_relances || [])
        .filter(e => e.statut_detail === 'BROUILLON');

      this.nombreEtapes = etapes.length;
    });
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toLocaleString();
  }

  logout() {
    this.authService.logout();
  }

  toggleMenu(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  isRelanceDetailsRoute(): boolean {
    return this.router.url.startsWith('/relance-dossiers/');
  }

  get isResponsable(): boolean {
    return this.authService.currentUserValue?.role === 'responsable';
  }
}
