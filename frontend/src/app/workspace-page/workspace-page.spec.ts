import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspacePage } from './workspace-page';

describe('WorkspacePage', () => {
  let component: WorkspacePage;
  let fixture: ComponentFixture<WorkspacePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspacePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
