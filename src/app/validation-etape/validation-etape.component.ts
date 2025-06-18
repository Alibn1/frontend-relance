import { Component, OnInit } from '@angular/core';
import { RelanceService } from '../services/relance.service';
import {MATERIAL_PROVIDERS} from '../material';

@Component({
  selector: 'app-validation-etape',
  templateUrl: './validation-etape.component.html',
  imports: [
    MATERIAL_PROVIDERS
  ]
})
export class ValidationEtapeComponent implements OnInit {
  etapes: any[] = [];

  constructor(private relanceService: RelanceService) {}

  ngOnInit() {
    this.relanceService.getAllRelances().subscribe((relances: any[]) => {
      this.etapes = relances
        .flatMap(r => r.etape_relances || [])
        .filter(e => e.statut_detail === 'BROUILLON'); // Affiche que les brouillons
    });
  }

  mettreAJourStatut(numero: string, nouveauStatut: 'VALIDE' | 'REFUSE') {
    this.relanceService.updateEtapeStatut(numero, nouveauStatut).subscribe(() => {
      const index = this.etapes.findIndex(e => e.numero_relance === numero);
      if (index !== -1) {
        this.etapes[index].statut_detail = nouveauStatut;
      }
    });
  }
}
