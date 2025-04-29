import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelanceHistoriqueComponent } from './relance-historique.component';

describe('RelanceHistoriqueComponent', () => {
  let component: RelanceHistoriqueComponent;
  let fixture: ComponentFixture<RelanceHistoriqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelanceHistoriqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelanceHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
