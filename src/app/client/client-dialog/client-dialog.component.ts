import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MATERIAL_PROVIDERS } from '../../material';

@Component({
  selector: 'app-client-dialog',
  templateUrl: './client-dialog.component.html',
  imports: [
    MATERIAL_PROVIDERS
  ],
  styleUrls: ['./client-dialog.component.css']
})
export class ClientDialogComponent {
  clientForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ClientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.clientForm = this.fb.group({
      raison_sociale: [data?.raison_sociale || '', Validators.required],
      email: [data?.email || '', Validators.required],
      telephone: [data?.telephone || '', Validators.required],
      adresse: [data?.adresse || '', Validators.required],
      ville: [data?.ville || ''],
      pays: [data?.pays || ''],
      responsable: [data?.responsable || ''],
      secteur_activite: [data?.secteur_activite || ''],
      solde: [data?.solde || ''],
      encours_autorise: [data?.encours_autorise || ''],
      actif: [data?.actif ?? true]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.clientForm.valid) {
      this.dialogRef.close(this.clientForm.value);
    }
  }
}
