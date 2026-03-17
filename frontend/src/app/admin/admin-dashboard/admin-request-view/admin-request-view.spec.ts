import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRequestView } from './admin-request-view';

describe('AdminRequestView', () => {
  let component: AdminRequestView;
  let fixture: ComponentFixture<AdminRequestView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRequestView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRequestView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
