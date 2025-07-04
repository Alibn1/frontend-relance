import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Ajout de Validators
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MATERIAL_PROVIDERS } from '../../material';
import { FlashMessageComponent } from '../../UI-UX/flash-message/flash-message.component';

@Component({
  selector: 'app-evenement-ajout',
  standalone: true,
  templateUrl: './evenement-ajout.component.html',
  styleUrls: ['./evenement-ajout.component.css'],
  imports: [
    MATERIAL_PROVIDERS,
    FlashMessageComponent
  ]
})
export class EvenementAjoutComponent {
  form: FormGroup;
  flashMessage = '';
  flashType: 'success' | 'error' | 'info' = 'success';
  showFlash = false;

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

  showFlashMsg(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.flashMessage = message;
    this.flashType = type;
    this.showFlash = true;
    setTimeout(() => this.showFlash = false, 3000);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.showFlashMsg('Veuillez remplir tous les champs requis.', 'error');
      return;
    }

    const finalData = {
      ...this.form.value,
      numero_relance: this.data.numero_relance,
      actif: '1'
    };

    this.dialogRef.close(finalData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
