import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserView } from './admin-user-view';

describe('AdminUserView', () => {
  let component: AdminUserView;
  let fixture: ComponentFixture<AdminUserView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
