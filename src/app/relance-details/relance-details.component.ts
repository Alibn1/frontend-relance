import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RelanceService } from '../services/relance.service';
import { ApiService } from '../services/api.service';
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
import {FlashMessageComponent} from '../flash-message/flash-message.component';


@Component({
  selector: 'app-detail-relance',
  templateUrl: './relance-details.component.html',
  styleUrls: ['./relance-details.component.css'],
  standalone: true,
  imports: [MATERIAL_PROVIDERS, RelanceInfoComponent, EventHistoryComponent, FlashMessageComponent],
  providers: [provideNativeDateAdapter()]
})
export class DetailRelanceComponent implements OnInit {
  opened = true;
  relanceId = '';
  relance: any = null;
  isLoading = true;
  isHistoryOpen = false;

  flashMessage = '';
  flashType: 'success' | 'error' | 'info' = 'success';
  showFlash = false;

  readonly apiUrl = environment.apiUrl;

  displayedColumns: string[] = ['libelle', 'date', 'debit', 'credit', 'solde'];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private location: Location,
    private relanceService: RelanceService,
    private dialog: MatDialog,
    private etapeRelanceService: EtapeRelanceService,
    private evenementService: EvenementService
  ) {}

  ngOnInit(): void {
    this.relanceId = this.route.snapshot.paramMap.get('id') || '';
    const state = history.state;
    if (state && state.flashMessage) {
      this.showFlashMsg(state.flashMessage, state.flashType || 'success');
    }
    this.loadRelanceDetails();
  }

  showFlashMsg(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.flashMessage = message;
    this.flashType = type;
    this.showFlash = true;
    setTimeout(() => this.showFlash = false, 3200);
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
      error: () => {
        this.showFlashMsg('Erreur de connexion au serveur', 'error');
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
        this.showFlashMsg(`Statut changé vers "${newStatus}"`, 'success');
        this.loadRelanceDetails();
      },
      error: () => {
        this.showFlashMsg('Impossible de changer le statut', 'error');
      }
    });
  }

  navigateToCreateEvent(): void {
    const firstEtape = this.relance?.etapes?.[0];
    if (this.relance?.ndr && firstEtape?.numero_relance) {
      this.router.navigate([`/relance-dossiers/${this.relance.ndr}/etapes/${firstEtape.numero_relance}/evenements/create`]);
    } else {
      this.showFlashMsg('Aucune étape disponible pour cette relance.', 'error');
    }
  }

  navigateToEventHistory(): void {
    const firstEtape = this.relance?.etapes?.[0];
    if (this.relance?.ndr && firstEtape?.numero_relance) {
      this.router.navigate([`/relance-dossiers/${this.relance.ndr}/evenements`]);
    } else {
      this.showFlashMsg('Aucune étape disponible pour afficher l\'historique', 'error');
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
            this.showFlashMsg('Étape supprimée avec succès', 'success');
            this.loadRelanceDetails();
          },
          error: () => {
            this.showFlashMsg('Erreur lors de la suppression', 'error');
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
        user_creation: 'admin'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.evenementService.createEvenement(ndr, ner, result).subscribe({
          next: () => {
            this.showFlashMsg('Événement ajouté avec succès', 'success');
            this.loadRelanceDetails();
          },
          error: () => {
            this.showFlashMsg('Erreur lors de la création de l\'événement', 'error');
          }
        });
      }
    });
  }

  openDrawer(): void {
    this.isHistoryOpen = true;
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    document.querySelector('.container')?.classList.add('no-scroll');
  }

  closeDrawer(): void {
    this.isHistoryOpen = false;
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
    document.querySelector('.container')?.classList.remove('no-scroll');
  }

  changerStatut(numero_relance: string, nouveauStatut: string): void {
    this.apiService.patch(`etape-relances/${numero_relance}/change`, {
      statut_detail: nouveauStatut
    }).subscribe({
      next: () => {
        this.showFlashMsg('Statut mis à jour', 'success');
        this.loadRelanceDetails();
      },
      error: () => {
        this.showFlashMsg('Erreur lors du changement de statut', 'error');
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
