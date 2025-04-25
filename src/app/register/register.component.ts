import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Import des modules nécessaires d'Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {NgIf} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgIf,
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_c: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  // Validation des mots de passe
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password_c')?.value
      ? null
      : { mismatch: true };
  }

  // Soumission du formulaire
  onSubmit() {
    if (this.registerForm.invalid) {
      return; // Si le formulaire est invalide, on ne fait rien
    }

    this.isLoading = true;
    const formData = this.registerForm.value;

    this.authService.register(formData).subscribe({
      next: () => {
        this.snackBar.open('Inscription réussie!', 'Fermer', {
          duration: 5000,
          panelClass: ['success-snackbar'],
        });
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'Erreur inscription',
          'Fermer',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
        this.isLoading = false;
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']); // Rediriger vers la page de connexion
  }
}
