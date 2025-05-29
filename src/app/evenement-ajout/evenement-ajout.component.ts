import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {MATERIAL_PROVIDERS} from '../material';

@Component({
  selector: 'app-evenement-ajout',
  standalone: true,
  templateUrl: './evenement-ajout.component.html',
  styleUrls: ['./evenement-ajout.component.css'],
  imports: [
    MATERIAL_PROVIDERS
  ]
})
export class EvenementAjoutComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EvenementAjoutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      statut: [''],
      contact: [''],
      date_promesse: [''],
      solde_a_relancer: [''],
      date_prochaine_action: [''],
      observation: ['']
    });

  }

  onSubmit(): void {
    if (this.form.valid) {
      const finalData = {
        ...this.form.value,
        numero_relance: this.data.numero_relance,
        actif: '1'
      };
      this.dialogRef.close(finalData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
