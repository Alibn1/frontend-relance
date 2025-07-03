import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { MATERIAL_PROVIDERS } from '../../material';
import { MAT_DATE_FORMATS } from '@angular/material/core';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@Component({
  selector: 'app-client-list',
  standalone: true,
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css'],
  imports: [...MATERIAL_PROVIDERS],
  providers: [
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class ClientListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'code_client', 'raison_sociale', 'solde_releve', 'total_impaye', 'date_relevee', 'derniere_relance', 'details'
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  loading = true;
  error = '';
  noDataFound = false;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];
  pageIndex = 0;
  totalItems = 0;
  selectedAgent: string = '';
  selectedDate: Date | null = null;
  uniqueAgents: string[] = [];
  tempDate: Date = new Date();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private clientService: ClientService, private router: Router, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        let enrichedData = this.enrichirClients(data);
        enrichedData = enrichedData.sort((a, b) => a.code_client.localeCompare(b.code_client));
        this.uniqueAgents = [...new Set(enrichedData.map(c => c.executant_envoi).filter(Boolean))];
        this.dataSource.data = enrichedData;
        this.totalItems = enrichedData.length;
        this.noDataFound = enrichedData.length === 0;
        this.loading = false;
        if (this.paginator && this.sort) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des clients';
        this.loading = false;
        console.error(err);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  enrichirClients(clients: any[]): any[] {
    return clients.map(client => {
      const releves = client.releves ?? [];

      // 🔽 Tri des relevés par date croissante pour prendre le plus ancien
      const relevesSorted = [...releves].sort(
        (a, b) => new Date(a.date_releve).getTime() - new Date(b.date_releve).getTime()
      );
      const firstReleve = relevesSorted[0];

      const totalSoldeFinale = releves.reduce((acc: number, r: any) => acc + (+r.solde_finale || 0), 0);
      const totalSoldeInitiale = releves.reduce((acc: number, r: any) => acc + (+r.solde_initiale || 0), 0);
      const totalImpayes = releves.reduce((acc: number, r: any) => acc + ((+r.solde_initiale || 0) - (+r.solde_finale || 0)), 0);
      const lastEtape = this.getDerniereEtape(client.etape_relances);

      return {
        ...client,
        executant_envoi: lastEtape?.executant_envoi ?? '',
        raison_sociale: client.R_sociale ?? client.raison_sociale,
        solde_releve: totalSoldeInitiale,
        total_impaye: totalImpayes,
        date_relevee: firstReleve?.date_releve ?? null,
        derniere_relance: lastEtape?.date_creation_debut ?? null,
        nb_jours_rappel: lastEtape?.nombre_jour_rappel ?? 30
      };
    });
  }

  applyAdvancedFilter(): void {
    const agentFilter = this.selectedAgent?.toLowerCase() || '';
    const selectedDate = this.selectedDate;
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const matchesAgent = !agentFilter || (data.executant_envoi?.toLowerCase() === agentFilter);
      const matchesDate = !selectedDate || (
        data.date_relevee &&
        new Date(data.date_relevee).getFullYear() === selectedDate.getFullYear() &&
        new Date(data.date_relevee).getMonth() === selectedDate.getMonth()
      );
      return matchesAgent && matchesDate;
    };
    this.dataSource.filter = Math.random().toString();
  }

  resetFilters(): void {
    this.selectedAgent = '';
    this.selectedDate = null;
    this.applyAdvancedFilter();
  }

  getDerniereEtape(etapes: any[]): any | null {
    if (!etapes || etapes.length === 0) return null;
    const validEtapes = etapes.filter(e => e.date_creation_debut && !isNaN(new Date(e.date_creation_debut).getTime()));
    if (validEtapes.length === 0) return null;
    return validEtapes.sort((a, b) => new Date(b.date_creation_debut).getTime() - new Date(a.date_creation_debut).getTime())[0];
  }

  getRelanceBadgeClass(date: string | Date, nbJoursRappel: number): string {
    const days = this.getDaysElapsed(date);
    return days <= nbJoursRappel ? 'badge badge-warning' : 'badge badge-danger';
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-inconnu';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('payé')) return 'status-paye';
    if (statusLower.includes('impayé')) return 'status-impaye';
    if (statusLower.includes('en cours')) return 'status-en-cours';
    return 'status-inconnu';
  }

  openClientDetails(clientCode: string): void {
    this.router.navigate(['/clients', clientCode]);
  }

  getDaysElapsed(dateString: string | Date): number {
    if (!dateString) return -1;
    const today = new Date();
    const dateValue = new Date(dateString);
    const diffTime = Math.abs(today.getTime() - dateValue.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  chosenYearHandler(normalizedYear: Date) {
    this.tempDate.setFullYear(normalizedYear.getFullYear());
  }

  chosenMonthHandler(normalizedMonth: Date, datepicker: any) {
    this.tempDate.setMonth(normalizedMonth.getMonth());
    this.selectedDate = new Date(this.tempDate.getFullYear(), this.tempDate.getMonth(), 1);
    this.applyAdvancedFilter();
    datepicker.close();
  }

  getElapsedBadgeClass(date: string | Date): string {
    const days = this.getDaysElapsed(date);
    return days <= 30 ? 'badge badge-warning' : 'badge badge-danger';
  }

  handlePageEvent(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
