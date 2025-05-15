import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvenementHistoryComponent } from './evenement-history.component';

describe('EvenementHistoryComponent', () => {
  let component: EvenementHistoryComponent;
  let fixture: ComponentFixture<EvenementHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvenementHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvenementHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
