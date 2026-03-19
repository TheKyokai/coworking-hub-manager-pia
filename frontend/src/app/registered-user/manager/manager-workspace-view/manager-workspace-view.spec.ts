import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerWorkspaceView } from './manager-workspace-view';

describe('ManagerWorkspaceView', () => {
  let component: ManagerWorkspaceView;
  let fixture: ComponentFixture<ManagerWorkspaceView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerWorkspaceView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerWorkspaceView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
