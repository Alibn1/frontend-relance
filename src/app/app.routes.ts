import { Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {ClientListComponent} from './client/client-list/client-list.component';
import {ClientDetailsComponent} from './client/client-details/client-details.component';
import {NouvelleRelanceComponent} from './relance/nouvelle-relance/nouvelle-relance.component';
import { RelanceHistoriqueComponent } from './relance/relance-historique/relance-historique.component';
import { DetailRelanceComponent } from './relance/relance-details/relance-details.component';
import {EventHistoryComponent} from './evenement/evenement-history/evenement-history.component';
import {GestionClientsComponent} from './client/gestion-clients/gestion-clients.component';
import {ValidationEtapeComponent} from './validation-etape/validation-etape.component';
import {GestionReleveComponent} from './gestion-releve/gestion-releve.component';
import {AuthenticatedLayoutComponent} from './layouts/authenticated-layout.component';
import {PublicLayoutComponent} from './layouts/public-layout.component';
import {AuthGuard} from './security/guards/auth.guard';
import {AuthResolver} from './security/resolver/auth.resolver';









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
      {
        path: 'clients/gestion',
        component: GestionClientsComponent,
        canActivate: [AuthGuard],
        resolve: { user: AuthResolver }
      },
      {
        path: 'clients/releves',
        component: GestionReleveComponent,
        canActivate: [AuthGuard],
        resolve: { user: AuthResolver }
      },
      {
        path: 'clients/:code_client',
        component: ClientDetailsComponent,
        canActivate: [AuthGuard],
        resolve: { user: AuthResolver }
      },
      {
        path: 'clients/:code_client/relances/create',
        component: NouvelleRelanceComponent,
        canActivate: [AuthGuard],
        resolve: { user: AuthResolver }
      },
      {
        path: 'relances/historique',
        component: RelanceHistoriqueComponent,
        canActivate: [AuthGuard],
        resolve: { user: AuthResolver }
      },
      {
        path: 'relance-dossiers/:id',
        component: DetailRelanceComponent,
        canActivate: [AuthGuard],
        resolve: { user: AuthResolver }
      },
      {
        path: 'relance-dossiers/:numero_relance_dossier/evenements',
        component: EventHistoryComponent,
        canActivate: [AuthGuard],
        resolve: { user: AuthResolver }
      },
      {
        path: 'relances/validation',
        component: ValidationEtapeComponent,
        canActivate: [AuthGuard],
        resolve: { user: AuthResolver }
      },



    ]
  },
  { path: '**', redirectTo: '' }
];
