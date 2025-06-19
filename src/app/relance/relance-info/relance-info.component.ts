import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MATERIAL_PROVIDERS } from '../../material';

@Component({
  selector: 'app-relance-info',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, MATERIAL_PROVIDERS],
  templateUrl: './relance-info.component.html',
  styleUrls: ['./relance-info.component.css']
})
export class RelanceInfoComponent {
  @Input() relance: any;
  @Output() goBack = new EventEmitter<void>();
  // @Output() toggle = new EventEmitter<void>();
  @Output() history = new EventEmitter<void>(); // ✅ pour déclencher le drawer depuis relance-details
  @Output() changerStatut = new EventEmitter<string>();

  openDrawer() {
    this.history.emit();
  }

  getStatutColor(): string {
    const statut = this.relance?.statut?.toUpperCase();
    switch (statut) {
      case 'OUVERT': return '#4CAF50';
      case 'CLOTURE': return '#F44336';
      default: return '#9e9e9e';
    }
  }

  getStatutIcon(): string {
    switch (this.relance?.statut?.toUpperCase()) {
      case 'CLOTURE': return 'lock';
      case 'OUVERT': return 'lock_open';
      default: return 'lock_outline';
    }
  }

  getStatutsDisponibles(): string[] {
    const current = this.relance?.statut?.toUpperCase();
    if (current === 'OUVERT') return ['Cloture', 'Annule'];
    if (current === 'CLOTURE') return ['Ouvert', 'Annule'];
    if (current === 'ANNULE') return ['Ouvert', 'Cloture'];
    return [];
  }

  emitStatutChange(nouveauStatut: string) {
    this.changerStatut.emit(nouveauStatut);
  }
}
