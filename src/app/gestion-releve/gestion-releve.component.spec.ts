import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionReleveComponent } from './gestion-releve.component';

describe('GestionReleveComponent', () => {
  let component: GestionReleveComponent;
  let fixture: ComponentFixture<GestionReleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionReleveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionReleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
