import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';  // Correct import for MatSidenavModule
import { MatListModule } from '@angular/material/list'; // Correct import for MatNavList and MatListItem
import { MatIconButton } from '@angular/material/button';  // Correct import for MatIconButton

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule, // Import the correct module
    MatListModule,  // Import the correct module for MatNavList and MatListItem
    RouterOutlet,
    MatIconButton,  // Import the correct module for MatIconButton
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;
  isMenuOpen: boolean = false; // Initialize as false to keep the menu closed initially
  currentDateTime: string = '';

  constructor(protected authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe((status: boolean) => {
      this.isAuthenticated = status;
    });

    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000); // met à jour chaque seconde
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toLocaleString(); // ou utilise toLocaleTimeString() pour seulement l'heure
  }

  logout() {
    this.authService.logout();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;  // Toggle the sidenav visibility
  }
}
