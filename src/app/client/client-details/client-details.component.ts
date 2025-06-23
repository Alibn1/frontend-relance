import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { ClientService } from '../../services/client.service';
import { MatTableDataSource } from '@angular/material/table';
import {MATERIAL_PROVIDERS} from '../../material';
import {MatSort} from '@angular/material/sort';
import {FlashMessageComponent} from '../../UI-UX/flash-message/flash-message.component';

@Component({
  selector: 'app-client-details',
  imports: [
    MATERIAL_PROVIDERS,
    FlashMessageComponent
  ],
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.css'
})
export class ClientDetailsComponent implements OnInit {
  clientCode!: string;
  clientDetails: any = {};
  canCreateEtape: boolean = true;
  lastEtapeStatut: string = '';

  showFlash = false;
  flashMessage = '';
  flashType: 'success' | 'error' | 'info' = 'success';

  relances = new MatTableDataSource<any>();
  etape_relances = new MatTableDataSource<any>();
  releves = new MatTableDataSource<any>();
  impayes = new MatTableDataSource<any>();  // données fictives pour l'instant

  @ViewChild('sortRelances') sortRelances!: MatSort;
  @ViewChild('sortReleves') sortReleves!: MatSort;
  @ViewChild('sortImpayes') sortImpayes!: MatSort;



  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // On récupère le code_client depuis l'URL
    this.clientCode = this.route.snapshot.paramMap.get('code_client') ?? '';

    if (this.clientCode) {
      // Charger les détails du client (si tu veux afficher des infos client en haut plus tard)
      this.clientService.getClientById(this.clientCode).subscribe({
        next: (data) => {
          this.clientDetails = data;
        },
        error: (err) => console.error('Erreur lors du chargement du client:', err)
      });

      // Charger les relances
      //this.clientService.getClientRelances(this.clientCode).subscribe({
      this.clientService.getClientEtapeRelances(this.clientCode).subscribe({
        next: (relancesData) => {
          const trie = relancesData.sort((a: any, b: any) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
          });

          this.relances.data = trie;
          this.relances.sort = this.sortRelances;

          const lastStep = trie[0];
          this.lastEtapeStatut = lastStep?.statut_detail || '';
          this.canCreateEtape = this.lastEtapeStatut !== 'BROUILLON';
        },
        error: (err) => console.error('Erreur lors du chargement des relances:', err)
      });

      // Charger les relevés
      this.clientService.getClientReleves(this.clientCode).subscribe({
        next: (relevesData) => {
          this.releves.data = relevesData;
          this.releves.sort = this.sortReleves;
        },
        error: (err) => console.error('Erreur lors du chargement des relevés:', err)
      });

      // Charger des données fictives pour les impayés
      this.loadFakeImpayes();
      this.impayes.sort = this.sortImpayes;
    }
  }

  showFlashMsg(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.flashMessage = message;
    this.flashType = type;
    this.showFlash = true;
    setTimeout(() => this.showFlash = false, 3200);
  }

  getTotalSoldeInitiale(): number {
    return this.releves.data.reduce((acc: number, r: any) => acc + (parseFloat(r.solde_initiale) || 0), 0);
  }

  getTotalSoldeFinale(): number {
    return this.releves.data.reduce((acc: number, r: any) => acc + (parseFloat(r.solde_finale) || 0), 0);
  }

  getTotalReste(): number {
    return this.releves.data.reduce((acc: number, r: any) => {
      const initial = parseFloat(r.solde_initiale) || 0;
      const finale = parseFloat(r.solde_finale) || 0;
      return acc + (initial - finale);
    }, 0);
  }

  getTotalImpayesInitiale(): number {
    return this.impayes.data.reduce((acc: number, i: any) => acc + (parseFloat(i.valeur_initiale) || 0), 0);
  }

  getTotalImpayesReglee(): number {
    return this.impayes.data.reduce((acc: number, i: any) => acc + (parseFloat(i.valeur_reglee) || 0), 0);
  }

  getTotalImpayesReste(): number {
    return this.impayes.data.reduce((acc: number, i: any) => acc + (parseFloat(i.reste) || 0), 0);
  }



  goBack(): void {
    this.router.navigate(['/clients']);
  }

  navigateToNewRelance(): void {
    if (!this.canCreateEtape) {
      this.flashMessage = 'Veuillez traiter l\'étape actuelle';
      this.flashType = 'error';
      this.showFlash = true;

      setTimeout(() => {
        this.showFlash = false;
      }, 3000);

      return;
    }

    this.router.navigate(['relances', 'create'], { relativeTo: this.route });
  }


  getStatusClass(status: string): string {
    if (!status) return 'badge DEFAULT';
    const s = status.toUpperCase();
    if (s.includes('BROUILLON')) return 'badge BROUILLON';
    if (s.includes('ENVOYE') || s.includes('ENVOYÉ')) return 'badge ENVOYE';
    if (s.includes('OUVERTE')) return 'badge OUVERTE';
    if (s.includes('VALIDE')) return 'badge VALIDE';
    if (s.includes('REFUSE') || s.includes('REFUSÉ')) return 'badge REFUSE';
    if (s.includes('ENCOURS')) return 'badge ENCOURS';
    return 'badge DEFAULT';
  }

  statuts = [
    { code: 'BROUILLON', libelle: 'Brouillon', color: 'badge BROUILLON' },
    { code: 'VALIDE', libelle: 'Validé', color: 'badge VALIDE' },
    { code: 'ENVOYE', libelle: 'Envoyé', color: 'badge ENVOYE' },
    { code: 'REFUSE', libelle: 'Refusé', color: 'badge REFUSE' },
    { code: 'ANNULE', libelle: 'Annulé', color: 'badge ANNULE' },
    { code: 'ENCOURS', libelle: 'En cours', color: 'badge ENCOURS' }
  ];

  getBadgeClass(code: string): string {
    return this.statuts.find(s => s.code === code?.toUpperCase())?.color || 'badge DEFAULT';
  }

  getBadgeLabel(code: string): string {
    return this.statuts.find(s => s.code === code?.toUpperCase())?.libelle || code;
  }

  private loadFakeImpayes(): void {
    this.impayes.data = [
      // {
      //   recouvrement: 'RCV001',
      //   date: '2025-04-10',
      //   type: 'Facture',
      //   echeance: '2025-04-30',
      //   valeur_initiale: 5000,
      //   valeur_reglee: 2000,
      //   reste: 3000
      // },
      // {
      //   recouvrement: 'RCV002',
      //   date: '2025-03-15',
      //   type: 'Avoir',
      //   echeance: '2025-03-31',
      //   valeur_initiale: 3000,
      //   valeur_reglee: 3000,
      //   reste: 0
      // }
    ];
  }
}

