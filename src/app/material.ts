// src/app/material.ts
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {CommonModule, DatePipe, NgIf, NgStyle} from '@angular/common';
import {RouterLink, RouterModule, RouterOutlet} from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import {MatChipsModule} from '@angular/material/chips';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSidenav, MatSidenavContainer, MatSidenavModule} from '@angular/material/sidenav';
import {MatListItem, MatListModule, MatNavList} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatToolbar} from '@angular/material/toolbar';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import {MatCheckbox} from '@angular/material/checkbox';


export const MATERIAL_PROVIDERS = [
  // provideAnimations(),
  // importProvidersFrom(
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule,
    RouterModule,
    MatMenuModule,
    RouterOutlet,
    RouterLink,
    MatToolbar,
    MatSidenavContainer,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    DatePipe,
    MatDividerModule,
    MatListModule,
    MatNavList,
    MatSidenav,
    MatListItem,
    MatSidenavModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgIf,
    NgStyle,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    MatSelect,
    MatOption,
    MatCheckbox
  // ),
];
