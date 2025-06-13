import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../services/client.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MATERIAL_PROVIDERS} from '../material';

@Component({
  selector: 'app-gestion-clients',
  standalone: true,
  imports: [
    MATERIAL_PROVIDERS
  ], // ajoute MATERIAL_PROVIDERS + ReactiveFormsModule + MatDatepickerModule dans app.config.ts
  templateUrl: './gestion-clients.component.html',
  styleUrls: ['./gestion-clients.component.css']
})
export class GestionClientsComponent implements OnInit {
  clients: any[] = [];
  displayedColumns: string[] = [  'actions',
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
    'actif'];

  clientForm!: FormGroup;
  formVisible = false;
  editMode = false;
  clientEnEdition: any = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.chargerClients();
    this.clientForm = this.fb.group({
      raison_sociale: ['', Validators.required],
      email: [''],
      telephone: [''],
      adresse: [''],
      ville: [''],
      pays: [''],
      responsable: [''],
      secteur_activite: [''],
      solde: [0],
      encours_autorise: [0],
      actif: [true]
    });
  }

  chargerClients(): void {
    this.clientService.getClients().subscribe({
      next: (data) => (this.clients = data),
      error: () => this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 })
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
    const formData = this.clientForm.value;

    if (this.editMode && this.clientEnEdition) {
      this.clientService.updateClient(this.clientEnEdition.id, formData).subscribe({
        next: (updatedClient) => {
          const index = this.clients.findIndex(c => c.id === this.clientEnEdition.id);
          if (index > -1) this.clients[index] = updatedClient;
          this.snackBar.open('Client mis à jour', 'Fermer', { duration: 2000 });
          this.annuler();
        },
        error: () => this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 })
      });
    } else {
      this.clientService.addClient(formData).subscribe({
        next: (newClient) => {
          this.clients = [...this.clients, newClient];
          this.snackBar.open('Client ajouté', 'Fermer', { duration: 2000 });
          this.annuler();
        },
        error: () => this.snackBar.open('Erreur lors de l\'ajout', 'Fermer', { duration: 3000 })
      });
    }
  }

  supprimerClient(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.clients = this.clients.filter(c => c.id !== id);
          this.snackBar.open('Client supprimé', 'Fermer', { duration: 2000 });
        },
        error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 })
      });
    }
  }
}
