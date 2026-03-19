import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerReservationView } from './manager-reservation-view';

describe('ManagerReservationView', () => {
  let component: ManagerReservationView;
  let fixture: ComponentFixture<ManagerReservationView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerReservationView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerReservationView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
