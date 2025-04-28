import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button'; // Correction ici : utiliser MatButtonModule

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
    RouterOutlet
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isAuthenticated: boolean = false;
  isMenuOpen: boolean = false; // true par défaut pour affichage desktop
  currentDateTime: string = '';

  constructor(protected authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe((status: boolean) => {
      this.isAuthenticated = status;
    });

    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000); // Mise à jour de la date et heure
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
}
