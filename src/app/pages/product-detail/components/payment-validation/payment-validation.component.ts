import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from '../../../../core/services/order/order.service';
import { IMomoPayment } from '../../../../core/models/order-model';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { ButtonSpinnerComponent } from '../../../../shared/components/button-spinner/button-spinner.component';
import { cameroonPhoneValidator } from '../../../../shared/utils/cameroon_phone_validator';
import { PhoneFormatDirective } from '../../../../core/directives/phone-format.directive';

@Component({
  selector: 'flexnkentpay-payment-validation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ButtonSpinnerComponent,
    PhoneFormatDirective,
  ],
  templateUrl: './payment-validation.component.html',
  styleUrls: ['./payment-validation.component.scss'],
})
export class PaymentValidationComponent implements OnInit, OnDestroy {
  @Input() order_payment!: any;
  paymentForm!: FormGroup;
  isSubmitting: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private toastr: ToastrService,
    private activeModal: NgbModal
  ) {}

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      phone_number: ['', [Validators.required, cameroonPhoneValidator()]],
    });
  }

  get phoneControl() {
    return this.paymentForm.get('phone_number');
  }

  validatePayment() {
    if (this.paymentForm.valid) {
      this.isSubmitting = true;
      const paymentData: IMomoPayment = this.paymentForm.value;
      paymentData.order_id = this.order_payment.order_id;

      const paymentSubscription = this.orderService
        .initiatePayment(paymentData)
        .subscribe({
          next: () => {
            this.toastr.success('Payment successfully processed');
            this.closeModal();
            this.openSuccessModal();
          },
          error: (error) => {
            this.toastr.error('Something unexpected happened');
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });

      this.subscriptions.add(paymentSubscription);
    }
  }

  openSuccessModal() {
    const modalRef = this.activeModal.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Good Job!';
    modalRef.componentInstance.description =
      'Your payment has been successfully processed! Would you like to go to the transactions page?';
    modalRef.componentInstance.confirmLink = '/account/transactions';
  }

  closeModal(): void {
    this.activeModal.dismissAll();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
