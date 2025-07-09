import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegaladviceComponent } from './legaladvice.component';

describe('LegaladviceComponent', () => {
  let component: LegaladviceComponent;
  let fixture: ComponentFixture<LegaladviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegaladviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegaladviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
