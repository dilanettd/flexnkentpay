import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesAdminComponent } from './fees-admin.component';

describe('FeesAdminComponent', () => {
  let component: FeesAdminComponent;
  let fixture: ComponentFixture<FeesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeesAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
