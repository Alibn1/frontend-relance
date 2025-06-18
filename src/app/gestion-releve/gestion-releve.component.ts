import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../services/client.service';
import { ReleveService } from '../services/releve.service';
import { trigger, transition, style, animate } from '@angular/animations';
import {MATERIAL_PROVIDERS} from '../material';
import {FlashMessageComponent} from '../UI-UX/flash-message/flash-message.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDeleteComponent} from '../UI-UX/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-gestion-releve',
  standalone: true,
  imports: [
    MATERIAL_PROVIDERS,
    FlashMessageComponent
  ],
  templateUrl: './gestion-releve.component.html',
  styleUrls: ['./gestion-releve.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class GestionReleveComponent implements OnInit {
  clients: any[] = [];
  releves: any[] = [];
  selectedClient: any = null;
  editingReleve: any = null;
  clientSearch: string = '';
  isLoading = false;

  releveForm!: FormGroup;

  flashMessage = '';
  flashType: 'success' | 'error' | 'info' = 'success';
  showFlash = false;
  private isUpdate = !!this.editingReleve;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private releveService: ReleveService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe(data => {
      this.clients = data;
    });

    this.releveForm = this.fb.group({
      code_client: [''],
      date_releve: ['', Validators.required],
      solde_initiale: ['', Validators.required],
      solde_finale: ['', Validators.required],
      statut: ['EN_ATTTENTE'],
      commentaire: [''],
      created_by: ['admin']
    });
  }

  showFlashMsg(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.flashMessage = message;
    this.flashType = type;
    this.showFlash = true;
    setTimeout(() => this.showFlash = false, 3200);
  }

  onClientSelect(client: any) {
    this.selectedClient = client;
    this.releveForm.patchValue({ code_client: client.code_client });
    this.fetchReleves();
  }

  fetchReleves() {
    if (!this.selectedClient) return;
    this.isLoading = true;
    this.clientService.getClientReleves(this.selectedClient.code_client).subscribe({
      next: data => {
        this.releves = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSubmit() {
    if (this.releveForm.invalid) return;

    const formValue = this.releveForm.value;

    const payload = {
      ...formValue,
      date_releve: this.formatDateOnly(formValue.date_releve)
    };

    this.isLoading = true;

    const request = this.editingReleve
      ? this.releveService.updateReleve(this.editingReleve.id, payload)
      : this.releveService.createReleve(payload);

    request.subscribe({
      next: () => {
        this.fetchReleves();
        this.releveForm.reset({ created_by: 'admin', code_client: this.selectedClient.code_client });
        this.editingReleve = null;
        this.isLoading = false;
        this.showFlashMsg(
          this.isUpdate ? 'Relevé mis à jour avec succès' : 'Relevé ajouté avec succès',
          'success'
        );
      },
      error: () => {
        this.isLoading = false;
        this.showFlashMsg('Erreur lors de l\'enregistrement du relevé', 'error');
      }
    });
  }

  editReleve(releve: any) {
    this.editingReleve = releve;
    this.releveForm.patchValue(releve);
  }

  cancelEdit() {
    this.editingReleve = null;
    this.releveForm.reset({ created_by: 'admin', code_client: this.selectedClient.code_client });
  }

  deleteReleve(id: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '350px',
      data: { message: 'Voulez-vous vraiment supprimer ce relevé ?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.isLoading = true;
        this.releveService.deleteReleve(id).subscribe({
          next: () => {
            this.fetchReleves();
            this.showFlashMsg('Relevé supprimé avec succès', 'success');
            this.isLoading = false;
          },
          error: () => {
            this.showFlashMsg('Erreur lors de la suppression du relevé', 'error');
            this.isLoading = false;
          }
        });
      }
    });
  }

  get filteredClients(): any[] {
    const search = this.clientSearch.toLowerCase();
    return this.clients.filter(c =>
      (c.raison_sociale + ' ' + c.ville + ' ' + c.pays)
        .toLowerCase()
        .includes(search)
    );
  }

  private formatDateOnly(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
