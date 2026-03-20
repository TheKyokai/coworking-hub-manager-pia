import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReservationView } from './user-reservation-view';

describe('UserReservationView', () => {
  let component: UserReservationView;
  let fixture: ComponentFixture<UserReservationView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserReservationView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserReservationView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
