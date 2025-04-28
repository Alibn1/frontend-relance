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
    if (this.loginForm.invalid) {
      return;  // Retour si le formulaire est invalide
    }

    this.isLoading = true;  // Affichage du spinner de chargement
    const { email, password } = this.loginForm.value;

    // Désactiver les champs du formulaire pendant la requête
    this.loginForm.disable();

    // Appel au service d'authentification
    this.authService.login(email, password).subscribe({
      next: (response) => {
        // Enregistrer le token et l'utilisateur
        this.authService.saveSession(response.access_token, response.user);
        // Rediriger vers la page des clients après connexion réussie
        this.router.navigate(['/clients']);
      },
      error: (error) => {
        // Afficher un message d'erreur dans un snackbar
        this.snackBar.open(
          error.error?.message || 'Identifiants incorrects, veuillez réessayer.',
          'Fermer',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      },
      // Always reset the loading state and re-enable the form in case of completion (success or failure)
      complete: () => {
        this.isLoading = false;  // Cacher le spinner
        this.loginForm.enable();  // Réactiver les champs du formulaire
      }
    });
  }

  // Méthode pour rediriger vers la page d'inscription
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
