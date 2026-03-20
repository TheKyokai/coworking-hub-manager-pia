import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationView } from './reservation-view';

describe('ReservationView', () => {
  let component: ReservationView;
  let fixture: ComponentFixture<ReservationView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
