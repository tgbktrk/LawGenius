import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawyerPendingListComponent } from './lawyer-pending-list.component';

describe('LawyerPendingListComponent', () => {
  let component: LawyerPendingListComponent;
  let fixture: ComponentFixture<LawyerPendingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LawyerPendingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LawyerPendingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
