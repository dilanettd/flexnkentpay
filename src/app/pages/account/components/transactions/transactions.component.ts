import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class TransactionsComponent implements OnInit, OnDestroy {
  txn: IMomoTransaction[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  refreshingTransactions: { [key: string]: boolean } = {};
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

  // Nouvelle méthode pour rafraîchir le statut d'une transaction
  refreshTransactionStatus(transaction: IMomoTransaction): void {
    // Vérifier si la transaction a un ID de transaction du fournisseur
    if (!transaction.provider_transaction_id) {
      return;
    }

    // Marquer cette transaction comme en cours de rafraîchissement
    this.refreshingTransactions[transaction.id] = true;

    this.subscriptions.add(
      this.orderService
        .checkPawaPayDepositStatus(transaction.provider_transaction_id)
        .subscribe({
          next: (updatedTransaction: IMomoTransaction) => {
            // Mettre à jour la transaction dans le tableau
            const index = this.txn.findIndex((t) => t.id === transaction.id);
            if (index !== -1) {
              this.txn[index] = { ...this.txn[index], ...updatedTransaction };
            }
            // Supprimer le marqueur de rafraîchissement
            delete this.refreshingTransactions[transaction.id];
          },
          error: (err) => {
            console.error('Erreur lors de la vérification du statut:', err);
            delete this.refreshingTransactions[transaction.id];
          },
        })
    );
  }

  // Vérifier si une transaction peut être rafraîchie
  canRefreshTransaction(transaction: IMomoTransaction): boolean {
    return (
      (transaction.status === 'pending' || transaction.status === 'failed') &&
      transaction.provider_type === 'pawapay' &&
      !!transaction.provider_transaction_id
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
