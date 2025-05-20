import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Initialisation du formulaire réactif
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Méthode pour soumettre le formulaire de connexion
  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.loginForm.disable();

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.loginForm.enable();
        })
      )
      .subscribe({
        next: (response) => {
          this.authService.handleLoginSuccess(response); // ✅ Utiliser la méthode complète
          this.router.navigate(['/clients']);            // 👈 ça redirigera bien
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Identifiants incorrects, veuillez réessayer.',
            'Fermer',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      });
  }

  // Méthode pour rediriger vers la page d'inscription
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
