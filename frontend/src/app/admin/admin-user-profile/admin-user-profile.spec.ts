import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserProfile } from './admin-user-profile';

describe('AdminUserProfile', () => {
  let component: AdminUserProfile;
  let fixture: ComponentFixture<AdminUserProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
