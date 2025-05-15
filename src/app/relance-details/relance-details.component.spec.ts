import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelanceDetailsComponent } from './relance-details.component';

describe('RelanceDetailsComponent', () => {
  let component: RelanceDetailsComponent;
  let fixture: ComponentFixture<RelanceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelanceDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelanceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
