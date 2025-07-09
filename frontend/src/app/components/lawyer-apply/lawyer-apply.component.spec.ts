import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawyerApplyComponent } from './lawyer-apply.component';

describe('LawyerApplyComponent', () => {
  let component: LawyerApplyComponent;
  let fixture: ComponentFixture<LawyerApplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LawyerApplyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LawyerApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
