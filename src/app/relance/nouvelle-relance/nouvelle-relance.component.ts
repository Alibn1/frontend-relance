import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RelanceService } from '../../services/relance.service';
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client.service';
import { Location } from '@angular/common';
import { catchError, switchMap, take, finalize, map } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { MATERIAL_PROVIDERS } from '../../material';
import { MatStepperModule } from '@angular/material/stepper';
import { FlashMessageComponent } from '../../UI-UX/flash-message/flash-message.component';

@Component({
  selector: 'app-nouvelle-relance',
  templateUrl: './nouvelle-relance.component.html',
  styleUrls: ['./nouvelle-relance.component.css'],
  standalone: true,
  imports: [
    MatStepperModule,
    MATERIAL_PROVIDERS,
    FlashMessageComponent
  ]
})
export class NouvelleRelanceComponent implements OnInit {
  clientCode: string = '';
  raisonSociale: string = '';
  releves: any[] = [];
  displayedColumns: string[] = ['select', 'date', 'valeur_initiale', 'valeur_reglee', 'reste'];
  relanceForm!: FormGroup;
  today = new Date();
  isLoading = false;
  existingRelances: any[] = [];
  hasExistingRelances = false;

  flashMessage = '';
  flashType: 'success' | 'error' | 'info' = 'success';
  showFlash = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private relanceService: RelanceService,
    private authService: AuthService,
    private clientService: ClientService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.clientCode = this.route.snapshot.paramMap.get('code_client') || '';
    if (!this.clientCode) {
      this.showErrorAndRedirect('Code client non valide');
      return;
    }

    this.clientService.getClientById(this.clientCode).pipe(take(1)).subscribe({
      next: (data) => this.raisonSociale = data?.raison_sociale || '',
      error: () => this.showNotification('Impossible de charger la raison sociale', true)
    });

    this.initForm();
    this.loadExistingRelances();
    this.loadClientReleves();

    // ➕ Logique de calcul automatique des jours
    this.infoForm.get('date_rappel')?.valueChanges.subscribe((selectedDate: Date) => {
      if (selectedDate) {
        const jours = this.calculerDiffJours(this.today, selectedDate);
        this.infoForm.get('nb_jours_rappel')?.setValue(jours);
      }
    });
  }

  showFlashMsg(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.flashMessage = message;
    this.flashType = type;
    this.showFlash = true;
    setTimeout(() => this.showFlash = false, 3000);
  }

  private initForm(): void {
    this.relanceForm = this.fb.group({
      code_releves: [[], Validators.required],
      info: this.fb.group({
        titre: ['Rappel de paiement', Validators.required],
        date_rappel: [this.today, Validators.required],
        nb_jours_rappel: [{ value: 0, disabled: true }, Validators.required],
        methode_envoi: ['Email', Validators.required],
        objet_relance1: [''],
        objet_relance2: ['']
      }),
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
      },
      error: (error) => this.handleRelancesError(error)
    });
  }

  private loadClientReleves(): void {
    this.clientService.getClientReleves(this.clientCode).pipe(take(1)).subscribe({
      next: (data) => {
        // ❗️Filtrer les relevés ayant statut EN_ATTENTE uniquement
        this.releves = data.filter((releve: any) => releve.statut === 'EN_ATTENTE');
      },
      error: () => this.showNotification('Impossible de charger les relevés', true)
    });
  }

  toggleReleveSelection(code: string, event: any): void {
    const selected = this.relanceForm.get('code_releves')?.value || [];
    if (event.checked) {
      if (!selected.includes(code)) selected.push(code);
    } else {
      const index = selected.indexOf(code);
      if (index !== -1) selected.splice(index, 1);
    }
    this.relanceForm.get('code_releves')?.setValue([...selected]);
  }

  isSelected(code: string): boolean {
    return this.relanceForm.get('code_releves')?.value?.includes(code);
  }

  onSubmit(): void {
    if (this.relanceForm.invalid || !this.clientCode) return;

    if (this.relanceForm.get('code_releves')?.value?.length === 0) {
      this.showFlashMsg("Vous devez sélectionner au moins un relevé pour créer une relance.", 'error');
      return;
    }

    this.isLoading = true;
    this.getOrCreateRelance().pipe(
      switchMap((ndr: string) =>
        this.addRelanceStep(ndr).pipe(map(() => ndr))
      ),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (ndr) => this.handleSuccess(ndr),
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
    const relanceData = {
      code_client: this.clientCode,
      statut: 'OUVERT'
    };

    return this.relanceService.createRelance(relanceData).pipe(
      map((response: any) => response?.data?.numero_relance_dossier || response?.numero_relance_dossier || response)
    );
  }

  private useExistingRelance(relance: any) {
    const ndr = relance?.numero_relance_dossier;
    if (!ndr) {
      console.error('Structure relance reçue:', relance);
      throw new Error('Impossible de trouver le numéro de dossier');
    }
    return of(ndr);
  }

  private addRelanceStep(ndr: string) {
    const formValues = this.relanceForm.getRawValue();
    const etapeData = {
      code_sous_modele: formValues.code_sous_modele,
      titre_sous_modele: formValues.info?.titre || '',
      statut_detail: 'BROUILLON',
      date_rappel: this.formatDate(formValues.info?.date_rappel),
      nb_jours_rappel: +formValues.info?.nb_jours_rappel || 0,
      methode_envoi: formValues.info?.methode_envoi || '',
      objet_relance_1: formValues.info?.objet_relance1 || '',
      objet_relance_2: formValues.info?.objet_relance2 || '',
      code_releves: formValues.code_releves
    };

    return this.relanceService.addRelanceStep(ndr, etapeData).pipe(
      catchError(error => {
        console.error('Erreur lors de l\'ajout de l\'étape:', error?.error || 'Erreur inconnue');
        return throwError(() => new Error('Échec de l\'ajout de l\'étape de relance'));
      })
    );
  }

  private formatDate(date: Date): string {
    if (!date || typeof date.toISOString !== 'function') return '';
    return date.toISOString().split('T')[0];
  }

  private handleSuccess(ndr: string): void {
    const message = this.hasExistingRelances
      ? 'Nouvelle étape ajoutée avec succès'
      : 'Relance et étape crée avec succès';
    this.showNotification(message);
    this.router.navigate(['/relance-dossiers', ndr], {
      state: {
        flashMessage: message,
        flashType: 'success'
      }
    });
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

  private handleRelancesError(error: any): void {
    console.error('Erreur API:', error);
    let errorMessage = 'Erreur lors du chargement des relances';
    if (error.status === 401) {
      errorMessage = 'Authentification requise - Veuillez vous reconnecter';
      this.authService.logout();
    }
    this.showNotification(errorMessage, true);
  }

  private showNotification(message: string, isError: boolean = false): void {
    this.showFlashMsg(message, isError ? 'error' : 'success');
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

  isAllSelected(): boolean {
    return this.releves.length > 0 &&
      this.relanceForm.get('code_releves')?.value?.length === this.releves.length;
  }

  isIndeterminate(): boolean {
    const selected = this.relanceForm.get('code_releves')?.value?.length || 0;
    return selected > 0 && selected < this.releves.length;
  }

  toggleAllReleves(event: any): void {
    const control = this.relanceForm.get('code_releves');
    if (event.checked) {
      const allCodes = this.releves.map(r => r.code_releve);
      control?.setValue(allCodes);
    } else {
      control?.setValue([]);
    }
  }

  private calculerDiffJours(dateDebut: Date, dateFin: Date): number {
    const debut = new Date(dateDebut.setHours(0, 0, 0, 0));
    const fin = new Date(dateFin.setHours(0, 0, 0, 0));
    const diffTime = fin.getTime() - debut.getTime();
    const diffJours = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffJours >= 0 ? diffJours : 0;
  }

  get infoForm(): FormGroup {
    return this.relanceForm.get('info') as FormGroup;
  }
}
