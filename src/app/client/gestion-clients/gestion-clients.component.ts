import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { MATERIAL_PROVIDERS } from '../../material';
import { ConfirmDeleteComponent } from '../../UI-UX/confirm-delete/confirm-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { FlashMessageComponent } from '../../UI-UX/flash-message/flash-message.component';
import { ClientDialogComponent } from '../client-dialog/client-dialog.component';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-gestion-clients',
  standalone: true,
  imports: [
    MATERIAL_PROVIDERS,
    FlashMessageComponent
  ],
  templateUrl: './gestion-clients.component.html',
  styleUrls: ['./gestion-clients.component.css']
})
export class GestionClientsComponent implements OnInit {
  clients: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'code_client',
    'raison_sociale',
    'email',
    'telephone',
    'adresse',
    'ville',
    'pays',
    'responsable',
    'secteur_activite',
    'solde',
    'encours_autorise',
    'actions'
  ];

  flashMessage = '';
  flashType: 'success' | 'error' | 'info' = 'success';
  showFlash = false;

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.chargerClients();
  }

  showFlashMsg(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.flashMessage = message;
    this.flashType = type;
    this.showFlash = true;
    setTimeout(() => this.showFlash = false, 3200);
  }

  chargerClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: () => this.showFlashMsg('Erreur lors du chargement', 'error')
    });
  }

  ouvrirFormulaire(): void {
    const dialogRef = this.dialog.open(ClientDialogComponent, {
      width: '700px',
      data: null
    });

    dialogRef.afterClosed().subscribe(formData => {
      if (formData) {
        this.clientService.addClient(formData).subscribe({
          next: (newClient) => {
            this.clients = [...this.clients, newClient];
            this.showFlashMsg('Client ajouté avec succès', 'success');
          },
          error: () => this.showFlashMsg('Erreur lors de l\'ajout', 'error')
        });
      }
    });
  }

  remplirFormulaire(client: any): void {
    const dialogRef = this.dialog.open(ClientDialogComponent, {
      width: '700px',
      data: client
    });

    dialogRef.afterClosed().subscribe(formData => {
      if (formData) {
        this.clientService.updateClient(client.id, formData).subscribe({
          next: (updatedClient) => {
            this.clients = this.clients.map(c =>
              c.id === client.id ? updatedClient : c
            );
            this.showFlashMsg('Client mis à jour avec succès', 'success');
          },
          error: () => this.showFlashMsg('Erreur lors de la mise à jour', 'error')
        });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  supprimerClient(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '350px',
      data: { message: 'Voulez-vous vraiment supprimer ce client ?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.clientService.deleteClient(id).subscribe({
          next: () => {
            this.clients = this.clients.filter(c => c.id !== id);
            this.showFlashMsg('Client supprimé avec succès', 'success');
          },
          error: () => this.showFlashMsg('Erreur lors de la suppression', 'error')
        });
      }
    });
  }
}
