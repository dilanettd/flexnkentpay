import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order/order.service';
import { IOrder } from '../../../../core/models/order-model';
import { ActivatedRoute, Router } from '@angular/router';
import { IPaginatedOrders } from '../../../../core/models/pagination.model';

@Component({
  selector: 'flexnkentpay-orders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-admin.component.html',
  styleUrl: './orders-admin.component.scss',
})
export class OrdersAdminComponent implements OnInit {
  orders: IOrder[] = [];
  isLoading: boolean = true;

  // Pagination
  currentPage: number = 1;
  perPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Filtres
  searchTerm: string = '';
  statusFilter: string = '';
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
      this.dateFrom = params['date_from'] || '';
      this.dateTo = params['date_to'] || '';
      this.currentPage = +params['page'] || 1;

      this.loadOrders();
    });
  }

  loadOrders(): void {
    this.isLoading = true;

    const filters = {
      keyword: this.searchTerm,
      status: this.statusFilter,
      date_from: this.dateFrom,
      date_to: this.dateTo,
      page: this.currentPage,
      per_page: this.perPage,
    };

    this.orderService.getAllOrders(filters).subscribe({
      next: (response: any) => {
        this.orders = response.data;
        this.totalItems = response.total;
        this.totalPages = response.last_page;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
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
      date_from: this.dateFrom || null,
      date_to: this.dateTo || null,
      page: this.currentPage !== 1 ? this.currentPage : null,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });

    this.loadOrders();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(price);
  }

  getInitials(name: string): string {
    if (!name) return 'U';

    const nameParts = name.split(' ');

    if (nameParts.length >= 2) {
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    } else {
      return (nameParts[0][0] + (nameParts[0][1] || 'X')).toUpperCase();
    }
  }

  getOrderStatus(order: IOrder): string {
    if (order.is_completed) return 'Completed';
    if (order.is_confirmed) return 'Confirmed';
    return 'Pending';
  }
}
