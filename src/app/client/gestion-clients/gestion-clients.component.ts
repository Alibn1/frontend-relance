import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { MATERIAL_PROVIDERS } from '../../material';
import { ConfirmDeleteComponent } from '../../UI-UX/confirm-delete/confirm-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { FlashMessageComponent } from '../../UI-UX/flash-message/flash-message.component';

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

  clientForm!: FormGroup;
  formVisible = false;
  editMode = false;
  clientEnEdition: any = null;

  // Flash message variables
  flashMessage = '';
  flashType: 'success' | 'error' | 'info' = 'success';
  showFlash = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.chargerClients();
    this.clientForm = this.fb.group({
      raison_sociale: ['', Validators.required],
      email: ['', Validators.required],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      ville: [''],
      pays: [''],
      responsable: [''],
      secteur_activite: [''],
      solde: [0, [Validators.required, Validators.min(0)]],
      encours_autorise: [0, [Validators.required, Validators.min(0)]],
      actif: [true]
    });
  }

  showFlashMsg(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.flashMessage = message;
    this.flashType = type;
    this.showFlash = true;
    setTimeout(() => this.showFlash = false, 3200);
  }

  chargerClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => (this.clients = data),
      error: () => this.showFlashMsg('Erreur lors du chargement', 'error')
    });
  }

  ouvrirFormulaire(): void {
    this.formVisible = true;
    this.editMode = false;
    this.clientForm.reset({ actif: true });
  }

  remplirFormulaire(client: any): void {
    this.editMode = true;
    this.formVisible = true;
    this.clientEnEdition = client;
    this.clientForm.patchValue(client);
  }

  annuler(): void {
    this.formVisible = false;
    this.clientForm.reset();
    this.clientEnEdition = null;
    this.editMode = false;
  }

  soumettreFormulaire(): void {
    if (this.clientForm.invalid) return;
    const formData = { ...this.clientForm.value, actif: true };

    if (this.editMode && this.clientEnEdition) {
      this.clientService.updateClient(this.clientEnEdition.id, formData).subscribe({
        next: (updatedClient) => {
          this.clients = this.clients.map(c =>
            c.id === this.clientEnEdition.id ? updatedClient : c
          );
          this.showFlashMsg('Client mis à jour avec succès ', 'success');
          this.annuler();
        },
        error: () => this.showFlashMsg('Erreur lors de la mise à jour', 'error')
      });
    } else {
      this.clientService.addClient(formData).subscribe({
        next: (newClient) => {
          this.clients = [...this.clients, newClient];
          this.showFlashMsg('Client ajouté avec succès', 'success');
          this.annuler();
        },
        error: () => this.showFlashMsg('Erreur lors de l\'ajout', 'error')
      });
    }
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
