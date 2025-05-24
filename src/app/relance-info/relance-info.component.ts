import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MATERIAL_PROVIDERS} from '../material';


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
  @Output() toggle = new EventEmitter<void>();
  @Output() history = new EventEmitter<void>();


  getStatutColor(): string {
    const statut = this.relance?.statut?.toUpperCase();
    switch (statut) {
      case 'OUVERT':
        return '#4CAF50'; // ✅ Vert
      case 'CLOTURE':
        return '#F44336'; // 🔒 Rouge
      default:
        return '#9e9e9e'; // Gris
    }
  }

  getStatutIcon(): string {
    switch (this.relance?.statut?.toUpperCase()) {
      case 'CLOTURE':
        return 'lock';
      case 'OUVERT':
        return 'lock_open';
      default:
        return 'lock_outline';
    }
  }
}
