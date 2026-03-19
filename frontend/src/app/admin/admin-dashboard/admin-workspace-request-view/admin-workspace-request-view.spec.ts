import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWorkspaceRequestView } from './admin-workspace-request-view';

describe('AdminWorkspaceRequestView', () => {
  let component: AdminWorkspaceRequestView;
  let fixture: ComponentFixture<AdminWorkspaceRequestView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminWorkspaceRequestView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminWorkspaceRequestView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
