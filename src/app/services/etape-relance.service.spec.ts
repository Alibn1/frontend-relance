import { TestBed } from '@angular/core/testing';

import { EtapeRelanceService } from './etape-relance.service';

describe('EtapeRelanceService', () => {
  let service: EtapeRelanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtapeRelanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
