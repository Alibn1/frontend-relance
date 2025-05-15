import {Component, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgFor, NgIf} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {EvenementService} from '../services/evenement.service';

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
  events: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  private num_relance_dossier!: string;
  private num_relance!: string;

  constructor(
    private route: ActivatedRoute,
    private evenementService: EvenementService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.num_relance_dossier = params['num_relance_dossier'];
      this.num_relance = params['num_relance'];
      if (this.num_relance_dossier && this.num_relance) {
        this.loadEventHistory();
      } else {
        this.errorMessage = 'Paramètres manquants pour récupérer l\'historique';
      }
    });
  }

  loadEventHistory(): void {
    if (!this.num_relance_dossier || !this.num_relance) {
      this.errorMessage = 'Paramètres manquants pour récupérer l\'historique';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.evenementService.getEvenements(this.num_relance_dossier, this.num_relance).subscribe({
      next: (response) => {
        this.events = Array.isArray(response) ? response : response?.evenements || [];

        this.events.forEach(event => {
          event.formattedDate = this.formatDate(event.date_evenement);
          event.formattedPromesse = this.formatDate(event.date_promesse);
          event.formattedAction = this.formatDate(event.date_prochaine_action);
        });

        if (this.events.length === 0) {
          this.errorMessage = 'Aucun événement trouvé pour cette étape';
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

  trackByEventId(index: number, event: any): string {
    return event?.numero_evenement || index.toString();
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'REALISE': return 'check_circle';
      case 'EN_COURS': return 'pending';
      case 'ECHEC': return 'error';
      default: return 'help_outline';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'REALISE': return 'success';
      case 'EN_COURS': return 'primary';
      case 'ECHEC': return 'warn';
      default: return '';
    }
  }
}
