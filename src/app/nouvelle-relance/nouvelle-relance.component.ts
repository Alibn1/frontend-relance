import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RelanceService } from '../services/relance.service';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, take, finalize, map } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

import {ClientService} from "../services/client.service";
import { Location } from '@angular/common';
import {MATERIAL_PROVIDERS} from '../material';


@Component({
  selector: 'app-nouvelle-relance',
  templateUrl: './nouvelle-relance.component.html',
  styleUrls: ['./nouvelle-relance.component.css'],
  standalone: true,
  imports: [
    MATERIAL_PROVIDERS
    // CommonModule,
    // ReactiveFormsModule,
    // MatCardModule,
    // MatFormFieldModule,
    // MatInputModule,
    // MatSelectModule,
    // MatDatepickerModule,
    // MatNativeDateModule,
    // MatButtonModule,
    // MatProgressSpinnerModule,
    // MatIconModule,
  ]
})
export class NouvelleRelanceComponent implements OnInit {
  clientCode: string = '';
  raisonSociale: string = '';


  relanceForm!: FormGroup;
  today = new Date();
  isLoading = false;
  existingRelances: any[] = [];
  hasExistingRelances = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private relanceService: RelanceService,
    private authService: AuthService,
    private clientService:  ClientService,
    private location: Location

  ) {}

  ngOnInit(): void {
    this.clientCode = this.route.snapshot.paramMap.get('code_client') || '';
    if (!this.clientCode) {
      this.showErrorAndRedirect('Code client non valide');
      return;
    }

    this.clientService.getClientById(this.clientCode).pipe(take(1)).subscribe({
      next: (data) => {
        this.raisonSociale = data?.raison_sociale || '';
      },
      error: (err) => {
        console.error('Erreur lors du chargement du client :', err);
        this.showNotification('Impossible de charger la raison sociale', true);
      }
    });

    this.initForm();
    this.loadExistingRelances();
  }

  private initForm(): void {
    this.relanceForm = this.fb.group({
      titre: ['Rappel de paiement', Validators.required],
      ordre: ['1', Validators.required],
      date_rappel: [this.today, Validators.required],
      nb_jours_rappel: [30, [Validators.required, Validators.min(1)]],
      methode_envoi: ['Email', Validators.required],
      objet_relance1: [''],
      objet_relance2: [''],
      code_sous_modele: [null, Validators.required]
    });
  }

  private loadExistingRelances(): void {
    this.isLoading = true;
    this.relanceService.getRelancesByClient(this.clientCode).pipe(
      take(1),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (relances: any[]) => {
        this.existingRelances = relances;
        this.hasExistingRelances = relances.length > 0;
        if (this.hasExistingRelances) {
          this.showNotification(`Ce client a déjà ${relances.length} relance(s) existante(s)`);
        }
      },
      error: (error) => this.handleRelancesError(error)
    });
  }

  private handleRelancesError(error: any): void {
    console.error('Erreur API:', error);
    let errorMessage = 'Erreur lors du chargement des relances';
    if (error.status === 401) {
      errorMessage = 'Authentification requise - Veuillez vous reconnecter';
      this.authService.logout();
    }
    this.showNotification(errorMessage, true);
  }

  onSubmit(): void {
    if (this.relanceForm.invalid || !this.clientCode) {
      this.showNotification('Veuillez remplir tous les champs obligatoires', true);
      return;
    }

    this.isLoading = true;
    this.getOrCreateRelance().pipe(
      switchMap((ndr: string) => this.addRelanceStep(ndr)),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => this.handleSubmitError(error)
    });
  }

  private getOrCreateRelance() {
    return this.relanceService.getRelancesByClient(this.clientCode).pipe(
      take(1),
      switchMap((response: any) => {
        const relances = response?.data || response || [];
        if (!Array.isArray(relances)) {
          throw new Error('Format de réponse inattendu');
        }
        if (relances.length === 0) {
          return this.createNewRelance();
        }
        return this.useExistingRelance(relances[0]);
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des relances:', error);
        return throwError(() => new Error('Échec de la récupération des relances existantes'));
      })
    );
  }

  private createNewRelance() {
    return this.relanceService.createRelance(this.clientCode).pipe(
      map((response: any) => response?.data?.numero_relance_dossier || response?.numero_relance_dossier || response)
    );
  }

  private useExistingRelance(relance: any) {
    console.error('Structure relance reçue:', JSON.stringify(relance));  // 👈 Pour bien voir la structure
    const ndr = relance?.numero_relance_dossier;
    if (!ndr) {
      console.error('Structure relance reçue:', relance);
      throw new Error('Impossible de trouver le numéro de dossier (numero relance dossier)');
    }
    return of(ndr);
  }

  private addRelanceStep(ndr: string) {
    const formValues = this.relanceForm.getRawValue();
    const etapeData = {
      code_sous_modele: formValues.code_sous_modele,
      titre_sous_modele: formValues.titre,
      ordre: +formValues.ordre,
      statut_detail: 'BROUILLON',
      date_rappel: this.formatDate(formValues.date_rappel),        // ✅ ici
      nb_jours_rappel: +formValues.nb_jours_rappel,                // ✅ ici
      methode_envoi: formValues.methode_envoi,                     // ✅ ici
      objet_relance_1: formValues.objet_relance1,                  // ✅ ici
      objet_relance_2: formValues.objet_relance2,                  // ✅ ici
      //utilisateur_creation: 'System'
    };


    console.log(' Données envoyées :', etapeData);

    return this.relanceService.addRelanceStep(ndr, etapeData).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'ajout de l\'étape:', error?.error || 'Erreur inconnue');
        return throwError(() => new Error('Échec de l\'ajout de l\'étape de relance'));
      })
    );
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private handleSuccess(): void {
    const message = this.hasExistingRelances
      ? 'Nouvelle étape ajoutée avec succès'
      : 'Relance et étape créées avec succès';
    this.showNotification(message);
    this.goBack();
  }

  private handleSubmitError(error: any): void {
    console.error('Erreur complète:', error);
    let errorMessage = 'Erreur technique';
    if (error.status === 400) {
      errorMessage = 'Données invalides';
    } else if (error.status === 401) {
      errorMessage = 'Authentification requise';
      this.authService.logout();
    } else if (error.message) {
      errorMessage = error.message;
    }
    this.showNotification(errorMessage, true);
  }

  private showNotification(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: isError ? ['error-snackbar'] : []
    });
  }

  private showErrorAndRedirect(message: string): void {
    this.showNotification(message, true);
    this.navigateToClients();
  }

  private navigateToClientRelances(): void {
    this.router.navigate(['/clients', this.clientCode, 'relances']);
  }

  private navigateToClients(): void {
    this.router.navigate(['/clients']);
  }

  goBack(): void {
    this.location.back();
  }

  cancel(): void {
    this.navigateToClientRelances();
  }
}
