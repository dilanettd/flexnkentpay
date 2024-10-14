import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'flexnkentpay-register-modal',
  standalone: true,
  imports: [],
  templateUrl: './register-modal.component.html',
  styleUrl: './register-modal.component.scss',
})
export class RegisterModalComponent {
  constructor(private activeModal: NgbModal) {}
  closeModal() {
    this.activeModal.dismissAll();
  }
}
