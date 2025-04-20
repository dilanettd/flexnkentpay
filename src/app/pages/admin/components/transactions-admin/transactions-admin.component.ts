import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IMomoTransaction } from '../../../../core/models/order-model';
import { IUser } from '../../../../core/models/auth.state.model';
import { IPaginatedTransactions } from '../../../../core/models/pagination.model';
import { OrderService } from '../../../../core/services/order/order.service';

@Component({
  selector: 'flexnkentpay-transactions-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions-admin.component.html',
  styleUrl: './transactions-admin.component.scss',
})
export class TransactionsAdminComponent implements OnInit {
  transactions: IMomoTransaction[] = [];
  isLoading: boolean = true;

  // Pagination
  currentPage: number = 1;
  perPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Filtres
  searchTerm: string = '';
  statusFilter: string = '';
  providerFilter: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchTerm = params['keyword'] || '';
      this.statusFilter = params['status'] || '';
      this.providerFilter = params['provider_type'] || '';
      this.dateFrom = params['date_from'] || '';
      this.dateTo = params['date_to'] || '';
      this.currentPage = +params['page'] || 1;

      this.loadTransactions();
    });
  }

  loadTransactions(): void {
    this.isLoading = true;

    const filters = {
      keyword: this.searchTerm,
      status: this.statusFilter,
      provider_type: this.providerFilter,
      date_from: this.dateFrom,
      date_to: this.dateTo,
      page: this.currentPage,
      per_page: this.perPage,
    };

    this.orderService.getAllTransactions(filters).subscribe({
      next: (response: any) => {
        this.transactions = response.data;
        this.totalItems = response.total;
        this.totalPages = response.last_page;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateUrl();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.updateUrl();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateUrl();
  }

  updateUrl(): void {
    const queryParams = {
      keyword: this.searchTerm || null,
      status: this.statusFilter || null,
      provider_type: this.providerFilter || null,
      date_from: this.dateFrom || null,
      date_to: this.dateTo || null,
      page: this.currentPage !== 1 ? this.currentPage : null,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });

    this.loadTransactions();
  }

  getUserInitials(user: IUser): string {
    if (!user || !user.name) return 'U';

    const nameParts = user.name.split(' ');

    if (nameParts.length >= 2) {
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    } else {
      return (nameParts[0][0] + (nameParts[0][1] || 'X')).toUpperCase();
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount);
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
