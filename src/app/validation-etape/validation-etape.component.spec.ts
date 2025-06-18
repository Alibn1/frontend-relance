import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationEtapeComponent } from './validation-etape.component';

describe('ValidationEtapeComponent', () => {
  let component: ValidationEtapeComponent;
  let fixture: ComponentFixture<ValidationEtapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationEtapeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationEtapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
