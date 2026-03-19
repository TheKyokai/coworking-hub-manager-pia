import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceView } from './workspace-view';

describe('WorkspaceView', () => {
  let component: WorkspaceView;
  let fixture: ComponentFixture<WorkspaceView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
