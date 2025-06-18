import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NouvelleRelanceComponent } from './nouvelle-relance.component';

describe('NouvelleRelanceComponent', () => {
  let component: NouvelleRelanceComponent;
  let fixture: ComponentFixture<NouvelleRelanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NouvelleRelanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NouvelleRelanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
