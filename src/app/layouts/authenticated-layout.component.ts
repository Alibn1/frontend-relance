import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component'; // adapte le chemin selon ton projet
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [NavbarComponent, ],
  template: `
    <app-navbar></app-navbar>
  `
})
export class AuthenticatedLayoutComponent {}
