import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { RelanceService } from '../../services/relance.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MATERIAL_PROVIDERS } from '../../material';
import { MatSort } from '@angular/material/sort';

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
  isMenuOpen = true;

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

  // Filtres actifs
  filtreStatutDossier = '';
  filtreDateRappel: Date | null = null;
  filtreStatutRelance = '';
  filtreUtilisateur = '';

  // Listes dynamiques pour filtres
  statutsDossier: string[] = [];
  statutsRelance: string[] = [];
  utilisateurs: string[] = [];

  ngOnInit(): void {
    this.relanceService.getAllRelances().subscribe(data => {
      const rows = data.flatMap((item: any) => {
        const etapes = item.etape_relances || [];

        if (etapes.length === 0) {
          return [{
            numero_relance_dossier: item.numero_relance_dossier,
            date_relance_dossier: this.formatDate(item.date_relance_dossier),
            client: `${item.client?.code_client ?? ''} ${item.client?.raison_sociale ?? ''}`,
            statut: item.statut?.libelle ?? '—',
            statut_code: item.statut?.code ?? 'BROUILLON',
            numero_relance: '—',
            date_rappel: '—',
            statut_detail: '—',
            utilisateur_creation: '—'
          }];
        }

        return etapes.map((etape: any) => ({
          numero_relance_dossier: item.numero_relance_dossier,
          date_relance_dossier: this.formatDate(item.date_relance_dossier),
          client: `${item.client?.code_client ?? ''} ${item.client?.raison_sociale ?? ''}`,
          statut: item.statut?.libelle ?? '—',
          statut_code: item.statut?.code ?? 'BROUILLON',
          numero_relance: etape.numero_relance ?? '—',
          date_rappel: this.formatDate(etape.date_rappel),
          statut_detail: etape.statut_detail ?? '—',
          utilisateur_creation: etape.executant_envoi ?? '—'
        }));
      });

      this.dataSource.data = rows;
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (item, property) => {
        if (property === 'numero_relance_dossier') {
          const match = item.numero_relance_dossier?.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        }
        return item[property];
      };

      // 🔄 Extraction dynamique pour filtres
      this.statutsDossier = [...new Set(rows.map(r => r.statut_code).filter(Boolean))];
      this.statutsRelance = [...new Set(rows.map(r => r.statut_detail).filter(s => s && s !== '—'))];
      this.utilisateurs = [...new Set(rows.map(r => r.utilisateur_creation).filter(u => u && u !== '—'))];

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

  appliquerFiltres() {
    this.dataSource.filterPredicate = (data, filter) => {
      const dateMatch = this.filtreDateRappel
        ? data.date_rappel === this.formatDate(this.filtreDateRappel.toISOString())
        : true;

      const statutDossierMatch = this.filtreStatutDossier
        ? data.statut_code === this.filtreStatutDossier
        : true;

      const statutRelanceMatch = this.filtreStatutRelance
        ? data.statut_detail === this.filtreStatutRelance
        : true;

      const userMatch = this.filtreUtilisateur
        ? data.utilisateur_creation === this.filtreUtilisateur
        : true;

      return dateMatch && statutDossierMatch && statutRelanceMatch && userMatch;
    };

    this.dataSource.filter = `${Math.random()}`; // Forcer rafraîchissement
  }

  resetFiltres() {
    this.filtreStatutDossier = '';
    this.filtreDateRappel = null;
    this.filtreStatutRelance = '';
    this.filtreUtilisateur = '';
    this.appliquerFiltres();
  }

  voirDossier(numero: string) {
    this.router.navigate(['/relance-dossiers', numero]);
  }

  // Pour badges colorés
  statuts = [
    { code: 'BROUILLON', libelle: 'Brouillon', color: 'badge BROUILLON' },
    { code: 'VALIDE', libelle: 'Validé', color: 'badge VALIDE' },
    { code: 'ENVOYE', libelle: 'Envoyé', color: 'badge ENVOYE' },
    { code: 'REFUSE', libelle: 'Refusé', color: 'badge REFUSE' },
    { code: 'ANNULE', libelle: 'Annulé', color: 'badge ANNULE' },
    { code: 'CLOTURE', libelle: 'Clôturé', color: 'badge CLOTURE' },
    { code: 'OUVERT', libelle: 'Ouvert', color: 'badge OUVERT' },
    { code: 'ENCOURS', libelle: 'En cours', color: 'badge ENCOURS' }
  ];

  getStatutColorClass(code: string): string {
    const found = this.statuts.find(s => s.code === code?.toUpperCase());
    return found ? found.color : 'badge DEFAULT';
  }

  getStatutLibelle(code: string): string {
    const found = this.statuts.find(s => s.code === code?.toUpperCase());
    return found ? found.libelle : code;
  }
}
