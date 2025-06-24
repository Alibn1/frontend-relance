import { Component, OnInit } from '@angular/core';
import { RelanceService } from '../services/relance.service';
import { MATERIAL_PROVIDERS } from '../material';
import {ConfirmDeleteComponent} from '../UI-UX/confirm-delete/confirm-delete.component';
import {MatDialog} from '@angular/material/dialog';
import {FlashMessageComponent} from '../UI-UX/flash-message/flash-message.component';

@Component({
  selector: 'app-validation-etape',
  templateUrl: './validation-etape.component.html',
  styleUrls: ['./validation-etape.component.css'],
  imports: [
    MATERIAL_PROVIDERS,
    FlashMessageComponent
  ]
})
export class ValidationEtapeComponent implements OnInit {
  etapes: any[] = [];

  constructor(
    private relanceService: RelanceService,
    private dialog: MatDialog

  ) {}

  ngOnInit() {
    this.relanceService.getAllRelances().subscribe((relances: any[]) => {
      this.etapes = relances
        .flatMap(r =>
          (r.etape_relances || []).map((etape: any) => ({
            ...etape,
            client: r.client, // pour code_client + raison_sociale
            user: { name: r.utilisateur_creation || 'Utilisateur inconnu' }, // même format que dans l'autre component
            modele: { titre: r.sous_modele?.titre || 'Non précisé' } // optionnel mais propre
          }))
        )
        .filter(e => e.statut_detail === 'BROUILLON')
        .sort((a, b) => new Date(a.date_creation_debut).getTime() - new Date(b.date_creation_debut).getTime());
    });
  }

  showFlash = false;
  flashMessage = '';
  flashType: 'success' | 'error' | 'info' = 'success';

  valider(etape: any): void {
    this.mettreAJourStatut(etape.numero_relance, 'VALIDE');
  }

  rejeter(etape: any): void {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      data: {
        message: `Voulez-vous vraiment rejeter l'étape ${etape.numero_relance} ?`,
        confirmLabel: 'Rejeter'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.mettreAJourStatut(etape.numero_relance, 'REFUSE');
      }
    });
  }

  mettreAJourStatut(numeroRelance: string, nouveauStatut: 'VALIDE' | 'REFUSE'): void {
    const index = this.etapes.findIndex(e => e.numero_relance === numeroRelance);
    if (index === -1) return;

    const card = document.querySelector(`#etape-${numeroRelance}`) as HTMLElement;
    if (card) {
      card.classList.add('removing');
    }

    setTimeout(() => {
      this.relanceService.updateEtapeStatut(numeroRelance, nouveauStatut).subscribe(() => {
        this.etapes.splice(index, 1);
        this.flashMessage = `Étape ${nouveauStatut === 'VALIDE' ? 'validée' : 'rejetée'} avec succès`;
        this.flashType = 'success';
        this.showFlash = true;

        setTimeout(() => {
          this.showFlash = false;
        }, 3000);
      });
    }, 400);
  }
}
