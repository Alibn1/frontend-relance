import { Component, OnInit, AfterViewInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { ClientService } from '../services/client.service';
import {MATERIAL_PROVIDERS} from '../material';


@Component({
  selector: 'app-client-list',
  standalone: true,
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css'],
  imports: [
    ...MATERIAL_PROVIDERS
  ],
  providers: [DatePipe]
})
export class ClientListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'code_client', 'raison_sociale', 'solde_releve', 'total_impaye', 'statut', 'date_relevee', 'derniere_relance', 'details'
  ];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  loading = true;
  error = '';
  noDataFound = false;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];
  pageIndex = 0;
  totalItems = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private clientService: ClientService, private router: Router, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        const enrichedData = this.enrichirClients(data);
        this.dataSource.data = enrichedData;
        this.loading = false;
        this.totalItems = enrichedData.length;
        this.noDataFound = enrichedData.length === 0;

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

      const totalSoldeFinale = releves.reduce((acc: number, r: any) => acc + (+r.solde_finale || 0), 0);
      const totalSoldeInitiale = releves.reduce((acc: number, r: any) => acc + (+r.solde_initiale || 0), 0);
      const totalImpayes = releves.reduce((acc: number, r: any) => acc + ((+r.solde_initiale || 0) - (+r.solde_finale || 0)), 0);

      return {
        ...client,
        raison_sociale: client.R_sociale ?? client.raison_sociale,
        solde_releve: totalSoldeInitiale,
        total_impaye: totalImpayes,
        statut: releves?.[0]?.statut ?? 'AUCUN',
        date_relevee: releves?.[0]?.date_releve ?? null,
        derniere_relance: this.getDerniereEtapeRelance(client.etape_relances)
      };
    });
  }

  getDerniereEtapeRelance(etapes: any[]): Date | null {
    if (!etapes || etapes.length === 0) return null;

    const validEtapes = etapes.filter(e =>
      e.date_creation_debut && !isNaN(new Date(e.date_creation_debut).getTime())
    );

    if (validEtapes.length === 0) return null;

    const sorted = validEtapes.sort((a, b) =>
      new Date(b.date_creation_debut).getTime() - new Date(a.date_creation_debut).getTime()
    );

    return new Date(sorted[0].date_creation_debut);
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
    if (!dateString) {
      return -1;
    }
    const today = new Date();
    const dateValue = new Date(dateString);
    const diffTime = Math.abs(today.getTime() - dateValue.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  handlePageEvent(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
