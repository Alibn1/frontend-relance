import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientService } from '../services/client.service';
import { ReleveService } from '../services/releve.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';

@Component({
  selector: 'app-gestion-releve',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput
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

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private releveService: ReleveService
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
      },
      error: () => this.isLoading = false
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
    if (confirm('Confirmer la suppression ?')) {
      this.releveService.deleteReleve(id).subscribe(() => this.fetchReleves());
    }
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
