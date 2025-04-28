import { Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {ClientListComponent} from './client-list/client-list.component';
import {AuthenticatedLayoutComponent} from './layouts/authenticated-layout.component';
import {PublicLayoutComponent} from './layouts/public-layout.component';
import {AuthGuard} from './guards/auth.guard';
import {AuthResolver} from './resolver/auth.resolver';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'   // Rediriger vers login directement si url vide
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    children: [
      { path: '', redirectTo: 'clients', pathMatch: 'full' },
      { path: 'clients', component: ClientListComponent,
        canActivate: [AuthGuard],
        resolve: { user: AuthResolver }
      },

    ]
  },
  { path: '**', redirectTo: '' }
];
