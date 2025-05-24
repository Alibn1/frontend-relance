import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelanceInfoComponent } from './relance-info.component';

describe('RelanceInfoComponent', () => {
  let component: RelanceInfoComponent;
  let fixture: ComponentFixture<RelanceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelanceInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelanceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
