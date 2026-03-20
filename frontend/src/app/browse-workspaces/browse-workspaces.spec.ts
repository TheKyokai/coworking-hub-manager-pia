import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseWorkspaces } from './browse-workspaces';

describe('BrowseWorkspaces', () => {
  let component: BrowseWorkspaces;
  let fixture: ComponentFixture<BrowseWorkspaces>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseWorkspaces]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseWorkspaces);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
