import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareBarCodeModalComponent } from './share-bar-code-modal.component';

describe('ShareBarCodeModalComponent', () => {
  let component: ShareBarCodeModalComponent;
  let fixture: ComponentFixture<ShareBarCodeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareBarCodeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareBarCodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
