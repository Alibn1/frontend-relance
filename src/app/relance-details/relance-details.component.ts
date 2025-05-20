import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RelanceService } from '../services/relance.service';
import { ApiService } from '../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { MATERIAL_PROVIDERS } from '../material';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-detail-relance',
  templateUrl: './relance-details.component.html',
  styleUrls: ['./relance-details.component.css'],
  standalone: true,
  imports: [...MATERIAL_PROVIDERS],
  providers: [provideNativeDateAdapter()]
})
export class DetailRelanceComponent implements OnInit {
  opened = true;
  relanceId = '';
  relance: any = null;
  isLoading = true;

  creances = [
    { libelle: 'Relevé', date: '2024-10', debit: 221280, credit: 0, solde: 221280 }
  ];
  displayedColumns: string[] = ['libelle', 'date', 'debit', 'credit', 'solde'];
  dataSource = new MatTableDataSource<any>(this.creances);

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
    console.log('relanceId:', this.relanceId);
    this.loadRelanceDetails();
    this.dataSource.data = this.creances;
  }

  loadRelanceDetails(): void {
    this.isLoading = true;
    this.relanceService.getRelanceDetails(this.relanceId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.relance = {
            ...data,
            ndr: data.numero_relance_dossier,
            date: data.date_relance,
            statut: data.statut?.code_statut ?? 'INCONNU',
            libelle: data.statut?.libelle_statut ?? 'Inconnu',
            couleur_statut: data.statut?.couleur_statut ?? '#9e9e9e',
            user: data.user_creation ?? 'Utilisateur inconnu',
            historique: data.historiques ?? [],
            etapes: data.etapes ?? [],
            documents: data.documents ?? [],
          };
        } else {
          this.showError(response.message || 'Erreur lors du chargement');
          this.router.navigate(['/relance-dossiers']);
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

  showError(message: string): void {
    this.snackBar.open(message, 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
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

  getStatutColor(): string {
    return this.relance?.couleur_statut || '#9e9e9e';
  }

  getStatutIcon(): string {
    switch (this.relance?.statut?.toUpperCase()) {
      case 'CLOTURE': return 'lock';
      case 'OUVERT': return 'lock_open';
      default: return 'lock_outline';
    }
  }

  navigateToCreateEvent(): void {
    const firstEtape = this.relance?.etapes?.[0];
    if (this.relance?.ndr && firstEtape?.numero_relance) {
      this.router.navigate([`/relance-dossiers/${this.relance.ndr}/etapes/${firstEtape.numero_relance}/evenements/create`])
        .catch(() => this.showError('Erreur lors de la redirection'));
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

  get totalSolde() {
    return this.dataSource.data.reduce((sum, c) => sum + c.solde, 0);
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
