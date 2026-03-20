import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateSpaceView } from './private-space-view';

describe('PrivateSpaceView', () => {
  let component: PrivateSpaceView;
  let fixture: ComponentFixture<PrivateSpaceView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateSpaceView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivateSpaceView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
