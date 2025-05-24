import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RelanceService } from '../services/relance.service';
import { ApiService } from '../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { MATERIAL_PROVIDERS } from '../material';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { RelanceInfoComponent } from '../relance-info/relance-info.component';

@Component({
  selector: 'app-detail-relance',
  templateUrl: './relance-details.component.html',
  styleUrls: ['./relance-details.component.css'],
  standalone: true,
  imports: [...MATERIAL_PROVIDERS, RelanceInfoComponent],
  providers: [provideNativeDateAdapter()]
})
export class DetailRelanceComponent implements OnInit {
  opened = true;
  relanceId = '';
  relance: any = null;
  isLoading = true;

  relevesEtape: any[] = [];
  displayedColumns: string[] = ['libelle', 'date', 'debit', 'credit', 'solde'];
  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar,
    private relanceService: RelanceService,
  ) {}

  ngOnInit(): void {
    this.relanceId = this.route.snapshot.paramMap.get('id') || '';
    this.loadRelanceDetails();
  }

  loadRelanceDetails(): void {
    this.isLoading = true;
    this.relanceService.getRelanceDetails(this.relanceId).subscribe({
      next: (response) => {
        const data = response?.data || response;

        this.relance = {
          ...data,
          ndr: data.numero_relance_dossier,
          date: data.date_relance_dossier,
          statut: data.statut?.code ?? 'INCONNU',
          libelle: data.statut?.libelle ?? 'Inconnu',
          couleur_statut: data.statut?.couleur ?? '#9e9e9e',
          user: data.utilisateur_creation ?? 'Utilisateur inconnu',
          modele: data.sous_modele ?? null,
          etapes: data.etapes ?? [],
        };

        const firstEtape = data.etapes?.[0];
        if (firstEtape) {
          this.relance.titre = firstEtape.titre_sous_modele;
          this.relance.date = firstEtape.date_rappel;
          this.relance.methode_envoi = firstEtape.methode_envoi;
          this.relance.modele = firstEtape.sous_modele;

          this.relevesEtape = firstEtape.releves ?? [];
          this.dataSource.data = this.relevesEtape;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur de récupération :', error);
        this.showError('Erreur de connexion au serveur');
        this.isLoading = false;
        this.router.navigate(['/relance-dossiers']);
      }
    });
  }


  get totalSolde() {
    return this.relevesEtape.reduce((sum, r) => sum + r.solde, 0);
  }

  toggleStatus(): void {
    if (!this.relance?.statut) return;
    const newStatus = this.relance.statut.toUpperCase() === 'OUVERT' ? 'Cloture' : 'Ouvert';

    this.apiService.patch(`relance-dossiers/${this.relanceId}/status`, { status: newStatus }).subscribe({
      next: () => {
        this.showSuccess(`Statut changé vers "${newStatus}"`);
        this.loadRelanceDetails();
      },
      error: (err) => {
        console.error('Erreur changement de statut', err);
        this.showError('Impossible de changer le statut');
      }
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  navigateToCreateEvent(): void {
    const firstEtape = this.relance?.etapes?.[0];
    if (this.relance?.ndr && firstEtape?.numero_relance) {
      this.router.navigate([`/relance-dossiers/${this.relance.ndr}/etapes/${firstEtape.numero_relance}/evenements/create`]);
    } else {
      this.showError('Aucune étape disponible pour cette relance.');
    }
  }

  navigateToEventHistory(): void {
    const firstEtape = this.relance?.etapes?.[0];
    if (this.relance?.ndr && firstEtape?.numero_relance) {
      this.router.navigate([`/relance-dossiers/${this.relance.ndr}/etapes/${firstEtape.numero_relance}/evenements`]);
    } else {
      this.showError('Aucune étape disponible pour afficher l\'historique');
    }
  }

  goBack(): void {
    window.history.length > 1 ? this.location.back() : this.router.navigate(['/relance-dossiers']);
  }

  confirmDelete(): void {
    this.snackBar.open('Suppression à implémenter', 'OK', { duration: 2500 });
  }

  printRelance() {
    console.log('Impression en cours...');
  }

  markAsDraft() {
    console.log('Marquer comme brouillon...');
  }
}
