import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RelanceService } from '../services/relance.service';
import { ApiService } from '../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { MATERIAL_PROVIDERS } from '../material';
import { provideNativeDateAdapter } from '@angular/material/core';
import { RelanceInfoComponent } from '../relance-info/relance-info.component';
import { MatDialog } from '@angular/material/dialog';
import {ConfirmDeleteComponent} from '../confirm-delete/confirm-delete.component';
import {EtapeRelanceService} from '../services/etape-relance.service';
import {EvenementAjoutComponent} from '../evenement-ajout/evenement-ajout.component';
import {EvenementService} from '../services/evenement.service';
import {environment} from '../../environments/environment';
import {EventHistoryComponent} from '../evenement-history/evenement-history.component';


@Component({
  selector: 'app-detail-relance',
  templateUrl: './relance-details.component.html',
  styleUrls: ['./relance-details.component.css'],
  standalone: true,
  imports: [MATERIAL_PROVIDERS, RelanceInfoComponent, EventHistoryComponent],
  providers: [provideNativeDateAdapter()]
})
export class DetailRelanceComponent implements OnInit {
  opened = true;
  relanceId = '';
  relance: any = null;
  isLoading = true;
  isHistoryOpen = false;


  readonly apiUrl = environment.apiUrl;

  displayedColumns: string[] = ['libelle', 'date', 'debit', 'credit', 'solde'];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar,
    private relanceService: RelanceService,
    private dialog: MatDialog,
    private etapeRelanceService: EtapeRelanceService,
    private evenementService: EvenementService
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
          etapes: (data.etape_relances ?? [])
            .sort((a: any, b: any) =>
              new Date(b.date_creation_debut).getTime() - new Date(a.date_creation_debut).getTime()
            )
            .map((etape: any) => ({
              ...etape,
              releves: (etape.releves ?? []).map((rel: any) => ({
                libelle: rel.code_releve,
                date: rel.date_releve,
                debit: rel.solde_initiale,
                credit: rel.solde_finale,
                solde: rel.solde_initiale - rel.solde_finale
              }))
            }))

        };

        this.isLoading = false;
      },
      error: (error) => {
        this.showError('Erreur de connexion au serveur');
        this.isLoading = false;
        this.router.navigate(['/relance-dossiers']);
      }
    });
  }

  getTotalSolde(releves: any[]): number {
    return (releves ?? []).reduce((sum, r) => sum + r.solde, 0);
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
      this.router.navigate([`/relance-dossiers/${this.relance.ndr}/evenements`]);
    } else {
      this.showError('Aucune étape disponible pour afficher l\'historique');
    }
  }

  goBack(): void {
    window.history.length > 1 ? this.location.back() : this.router.navigate(['/relance-dossiers']);
  }

  Delete(numero_relance: string): void {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      data: { message: 'Voulez-vous vraiment supprimer cette étape ?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.apiService.delete(`etape-relances/${numero_relance}`).subscribe({
          next: () => {
            this.showSuccess('Étape supprimée avec succès');
            this.loadRelanceDetails(); // recharge les données
          },
          error: () => {
            this.showError('Erreur lors de la suppression');
          }
        });
      }
    });
  }

  printRelance(numero_relance: string) {
    window.open(`${this.apiUrl}/public/etape-relances/${numero_relance}/pdf`, '_blank');
  }

  openEvenementDialog(ndr: string, ner: string, code_client: string): void {
    const dialogRef = this.dialog.open(EvenementAjoutComponent, {
      width: '500px',
      data: {
        numero_relance: ner,
        code_client: code_client,
        user_creation: 'admin' // tu peux récupérer dynamiquement plus tard
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.evenementService.createEvenement(ndr, ner, result).subscribe({
          next: () => {
            this.showSuccess('Événement ajouté avec succès');
            this.loadRelanceDetails(); // recharge les données
          },
          error: () => {
            this.showError('Erreur lors de la création de l\'événement');
          }
        });
      }
    });
  }

  openDrawer(): void {
    this.isHistoryOpen = true;
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');

    const container = document.querySelector('.container');
    if (container) container.classList.add('no-scroll');
  }

  closeDrawer(): void {
    this.isHistoryOpen = false;
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');

    const container = document.querySelector('.container');
    if (container) container.classList.remove('no-scroll');
  }


  changerStatut(numero_relance: string, nouveauStatut: string): void {
    this.apiService.patch(`etape-relances/${numero_relance}/change`, {
      statut_detail: nouveauStatut
  }).subscribe({
      next: () => {
        this.showSuccess('Statut mis à jour');
        this.loadRelanceDetails();
      },
      error: () => {
        this.showError('Erreur lors du changement de statut');
      }
    });
  }


  getLibelleStatut(code: string): string {
    return this.statuts.find(s => s.code === code)?.libelle || 'Statut inconnu';
  }

  getStatutIcon(code: string): string {
    return this.statuts.find(s => s.code === code)?.icon || 'help';
  }


  getStatutButtonColorClass(code: string): string {
    switch (code) {
      case 'BROUILLON': return 'btn-olive';
      case 'VALIDE': return 'btn-vert';
      case 'ENVOYE': return 'btn-bleu';
      case 'REFUSE': return 'btn-rouge';
      case 'CLOTURE': return 'btn-violet';
      default: return 'btn-light';
    }
  }

  statuts = [
    {
      code: 'BROUILLON',
      libelle: 'Brouillon',
      icon: 'edit',
      color: 'statut-icon-brouillon'
    },
    {
      code: 'VALIDE',
      libelle: 'Validé',
      icon: 'check_circle',
      color: 'statut-icon-vert'
    },
    {
      code: 'ENVOYE',
      libelle: 'Envoyé',
      icon: 'send',
      color: 'statut-icon-bleu'
    },
    {
      code: 'REFUSE',
      libelle: 'Refusé',
      icon: 'cancel',
      color: 'statut-icon-rouge'
    },
    {
      code: 'CLOTURE',
      libelle: 'Clôturé',
      icon: 'lock',
      color: 'statut-icon-violet'
    }
  ];



}
