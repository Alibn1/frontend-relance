import {Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { RelanceService } from '../../services/relance.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MATERIAL_PROVIDERS } from '../../material';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-relance-historique',
  templateUrl: './relance-historique.component.html',
  styleUrls: ['./relance-historique.component.css'],
  standalone: true,
  imports: [...MATERIAL_PROVIDERS],
  providers: [DatePipe]
})
export class RelanceHistoriqueComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  isLoading = true;
  isMenuOpen = true; // ❗️ à synchroniser avec le layout si besoin

  displayedColumns = [
    'numero_relance_dossier',
    'date_relance_dossier',
    'client',
    'statut',
    'numero_relance',
    'date_rappel',
    'statut_detail',
    'utilisateur_creation',
    'action'
  ];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private relanceService: RelanceService,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.relanceService.getAllRelances().subscribe(data => {
      const mapped = data.map((item: any) => {
        const etapes = item.etape_relances || [];
        const etape = etapes.length
          ? etapes.sort((a: any, b: any) =>
            new Date(b.date_rappel || b.created_at).getTime() - new Date(a.date_rappel || a.created_at).getTime()
          )[0]
          : null;

        return {
          numero_relance_dossier: item.numero_relance_dossier,
          date_relance_dossier: this.formatDate(item.date_relance_dossier),
          client: `${item.client?.code_client ?? ''} ${item.client?.raison_sociale ?? ''}`,
          statut: item.statut?.libelle ?? '—',
          statut_code: item.statut?.code ?? 'BROUILLON',
          numero_relance: etape?.numero_relance ?? '—',
          date_rappel: this.formatDate(etape?.date_rappel),
          statut_detail: etape ? etape.statut_detail : '—',
          utilisateur_creation: etape?.executant_envoi ?? '—'
        };
      });

      this.dataSource.data = mapped;

      // 🔁 Forcer le tri logique sur numero_relance_dossier
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (item, property) => {
        if (property === 'numero_relance_dossier') {
          const match = item.numero_relance_dossier?.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        }
        return item[property];
      };

      // this.dataSource.sort.active = 'numero_relance_dossier';
      // this.dataSource.sort.direction = 'asc';
      // this.dataSource.sort.sortChange.emit();

      this.isLoading = false;
    });
  }

  formatDate(date: string | undefined): string {
    return date ? this.datePipe.transform(date, 'yyyy-MM-dd') ?? '' : '';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  voirDossier(numero: string) {
    this.router.navigate(['/relance-dossiers', numero]);
  }

  getStatusClass(statut: string): string {
    switch (statut?.toUpperCase()) {
      case 'BROUILLON': return 'badge BROUILLON';
      case 'ENVOYE':
      case 'ENVOYÉ': return 'badge ENVOYE';
      case 'OUVERT': return 'badge OUVERT';
      case 'CLOTURE': return 'badge CLOTURE';
      case 'VALIDE': return 'badge VALIDE';
      case 'REFUSE':
      case 'REFUSÉ': return 'badge REFUSE';
      case 'EN COURS': return 'badge ENCOURS';
      default: return 'badge DEFAULT';
    }
  }
}
