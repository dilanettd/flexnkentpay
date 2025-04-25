import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OrderService } from '../../../../core/services/order/order.service';
import { IOrder } from '../../../../core/models/order-model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { LoginModalComponent } from '../../../../shared/components/login-modal/login-modal.component';
import { PaymentValidationComponent } from '../../../product-detail/components/payment-validation/payment-validation.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'flexnkentpay-purchases',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.scss',
})
export class PurchasesComponent {
  orders: IOrder[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.fetchUserOrders();
  }

  fetchUserOrders(): void {
    this.isLoading = true;
    this.orderService.getUserOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = this.translateService.instant('PURCHASES.ERROR.DEFAULT');
        this.isLoading = false;
      },
    });
  }

  openPaymentModal(order_payment: any) {
    if (this.authService.isAuthenticate()) {
      const modalRef = this.modalService.open(PaymentValidationComponent);
      modalRef.componentInstance.order_payment = order_payment;
      modalRef.result.then(() => {
        this.fetchUserOrders();
      });
    } else {
      this.toastr.error(
        this.translateService.instant('PURCHASES.PAYMENT.LOGIN_REQUIRED')
      );
      this.modalService.open(LoginModalComponent);
    }
  }

  cancelOrder(order: IOrder): void {
    if (order.is_confirmed === 1) {
      this.toastr.error(
        this.translateService.instant('PURCHASES.CANCEL.ALREADY_CONFIRMED')
      );
      return;
    }

    // Demander confirmation à l'utilisateur
    const confirmMessage = this.translateService.instant(
      'PURCHASES.CANCEL.CONFIRM_MESSAGE'
    );
    if (confirm(confirmMessage)) {
      this.isLoading = true;

      this.orderService.cancelOrder(order.id).subscribe({
        next: (response) => {
          this.toastr.success(
            this.translateService.instant('PURCHASES.CANCEL.SUCCESS')
          );
          // Rafraîchir la liste des commandes
          this.fetchUserOrders();
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(
            error.message ||
              this.translateService.instant('PURCHASES.CANCEL.ERROR')
          );
          console.error("Erreur lors de l'annulation de la commande:", error);
        },
      });
    }
  }
}
