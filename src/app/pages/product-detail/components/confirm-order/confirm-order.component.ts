import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { OrderService } from '../../../../core/services/order/order.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { cameroonPhoneValidator } from '../../../../shared/utils/cameroon_phone_validator';
import { PhoneFormatDirective } from '../../../../core/directives/phone-format.directive';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'flexnkentpay-confirm-order',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PhoneFormatDirective,
    TranslateModule,
  ],
  templateUrl: './confirm-order.component.html',
})
export class ConfirmOrderComponent implements OnInit, OnDestroy {
  @Input({ required: true }) totalAmount!: number;
  @Input({ required: true }) productId!: number;
  @Input({ required: true }) quantity!: number;
  @Input({ required: true }) price!: number;

  isSubmitted: boolean = false;
  orderForm: FormGroup;
  orderFeePercentage: number = 0;
  private subscriptions: Subscription = new Subscription();

  // Add step control
  currentStep: number = 1;

  get installmentAmount(): number {
    const count = this.orderForm.value.installment_count || 1;
    return Math.ceil(this.totalAmount / count);
  }

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private activeModal: NgbModal,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private translateService: TranslateService
  ) {
    this.orderForm = this.fb.group({
      installment_count: [1, [Validators.required, Validators.min(1)]],
      payment_frequency: ['daily', Validators.required],
      reminder_type: ['email', Validators.required],
      phone_number: ['', [Validators.required, cameroonPhoneValidator()]],
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.orderForm.get('quantity')?.valueChanges.subscribe(() => {
        this.updateTotalAmount();
      })
    );

    this.subscriptions.add(
      this.orderForm.get('payment_frequency')?.valueChanges.subscribe(() => {
        this.updateInstallmentCount();
      })
    );

    this.subscriptions.add(
      this.orderService.getFee('order').subscribe({
        next: (fees) => {
          this.orderFeePercentage = fees.percentage;
        },
        error: (err) => {
          console.error('Error fetching fees:', err);
        },
      })
    );
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  getInstallmentFee(): number {
    return Math.ceil(this.installmentAmount * (this.orderFeePercentage / 100));
  }

  getTotalFee(): number {
    return Math.ceil(this.totalAmount * (this.orderFeePercentage / 100));
  }

  updateInstallmentCount(): void {
    const frequency = this.orderForm.value.payment_frequency;
    let maxInstallments = 1;

    switch (frequency) {
      case 'daily':
        maxInstallments = Math.min(this.quantity, 30);
        break;
      case 'weekly':
        maxInstallments = Math.min(this.quantity, 4);
        break;
      case 'monthly':
        maxInstallments = Math.min(this.quantity, 1);
        break;
    }

    if (this.orderForm.value.installment_count > maxInstallments) {
      this.orderForm.patchValue({ installment_count: maxInstallments });
    }
  }

  updateTotalAmount(): void {
    const quantity = this.orderForm.value.quantity || 1;
    this.totalAmount = this.price * quantity;
  }

  closeModal(): void {
    this.activeModal.dismissAll();
  }

  openSuccessModal() {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = this.translateService.instant(
      'ORDER_CONFIRM.MESSAGES.SUCCESS_TITLE'
    );
    modalRef.componentInstance.description = this.translateService.instant(
      'ORDER_CONFIRM.MESSAGES.SUCCESS_DESCRIPTION'
    );
    modalRef.componentInstance.confirmLink = '/account/transactions';
  }

  get phoneControl() {
    return this.orderForm.get('phone_number');
  }

  confirmOrder(): void {
    if (this.orderForm.valid) {
      this.isSubmitted = true;
      const orderData = {
        ...this.orderForm.value,
        quantity: this.quantity,
        product_id: this.productId,
        total_amount: this.totalAmount,
        installment_amount: this.installmentAmount,
        fee_amount: this.getTotalFee(),
        installment_fee: this.getInstallmentFee(),
      };

      this.subscriptions.add(
        this.orderService.createOrder(orderData).subscribe({
          next: () => {
            this.isSubmitted = false;
            this.closeModal();
            this.toastr.success(
              this.translateService.instant('ORDER_CONFIRM.MESSAGES.SUCCESS')
            );
            this.openSuccessModal();
          },
          error: (err) => {
            this.isSubmitted = false;
            this.toastr.error(
              this.translateService.instant('ORDER_CONFIRM.MESSAGES.ERROR')
            );
          },
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
