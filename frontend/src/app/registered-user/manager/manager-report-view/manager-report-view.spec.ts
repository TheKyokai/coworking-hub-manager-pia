import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerReportView } from './manager-report-view';

describe('ManagerReportView', () => {
  let component: ManagerReportView;
  let fixture: ComponentFixture<ManagerReportView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerReportView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerReportView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
