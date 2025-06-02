import {Component, OnInit, Input, SimpleChanges} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgFor, NgIf } from '@angular/common';
import { EvenementService } from '../services/evenement.service';

@Component({
  selector: 'app-evenement-history',
  imports: [
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    NgFor,
    NgIf,
  ],
  templateUrl: './evenement-history.component.html',
  styleUrl: './evenement-history.component.css',
  standalone: true,
})
export class EventHistoryComponent implements OnInit {
  @Input() dossierId!: string;

  events: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private evenementService: EvenementService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dossierId'] && changes['dossierId'].currentValue) {
      this.loadEventHistory();
    }
  }

  ngOnInit(): void {
    if (this.dossierId) {
      this.loadEventHistory();
    } else {
      this.errorMessage = 'Numéro de dossier manquant pour l\'historique';
    }
  }

  loadEventHistory(): void {
    this.isLoading = true;
    this.evenementService.getEvenementsByDossier(this.dossierId).subscribe({
      next: (response) => {
        this.events = Array.isArray(response) ? response : response?.evenements || [];

        this.events.forEach(event => {
          event.formattedDate = this.formatDate(event.date_evenement);
          event.formattedPromesse = this.formatDate(event.date_promesse);
          event.formattedAction = this.formatDate(event.date_prochaine_action);
        });

        if (this.events.length === 0) {
          this.errorMessage = 'Aucun événement trouvé pour ce dossier';
        }
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage = error?.error?.message || 'Erreur lors du chargement des événements';
        this.events = [];
      },
      complete: () => this.isLoading = false
    });
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  retryLoadEventHistory(): void {
    this.loadEventHistory();
  }

}
