import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerWorkspaceRegistration } from './manager-workspace-registration';

describe('ManagerWorkspaceRegistration', () => {
  let component: ManagerWorkspaceRegistration;
  let fixture: ComponentFixture<ManagerWorkspaceRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerWorkspaceRegistration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerWorkspaceRegistration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
