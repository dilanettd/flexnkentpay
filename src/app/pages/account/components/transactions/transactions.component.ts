import { Component } from '@angular/core';
import { IMomoTransaction } from '../../../../core/models/order-model';
import { OrderService } from '../../../../core/services/order/order.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'flexnkentpay-transactions',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent {
  txn: IMomoTransaction[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  private subscriptions: Subscription = new Subscription();
  logo: string =
    'https://upload.wikimedia.org/wikipedia/fr/thumb/e/e9/Mtn-logo-svg.svg/1200px-Mtn-logo-svg.svg.png';

  constructor(
    private orderService: OrderService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.fetchUserOrders();
  }

  fetchUserOrders(): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.orderService.getUserMomoTransactions().subscribe({
        next: (data) => {
          this.txn = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = this.translateService.instant(
            'TRANSACTIONS.ERROR.FETCH_FAILED'
          );
          this.isLoading = false;
        },
      })
    );
  }

  retryFetch(): void {
    this.error = null;
    this.fetchUserOrders();
  }

  browseProducts(): void {
    // Navigate to products page
    // Cette fonction sera utilisée pour le bouton "Browse Products"
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
