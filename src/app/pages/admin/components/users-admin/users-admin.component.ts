import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user/user.service';
import { IUser } from '../../../../core/models/auth.state.model';
import { ActivatedRoute, Router } from '@angular/router';
import { IPaginatedUsers } from '../../../../core/models/pagination.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'flexnkentpay-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-admin.component.html',
  styleUrl: './users-admin.component.scss',
})
export class UsersAdminComponent implements OnInit {
  users: IUser[] = [];
  isLoading: boolean = true;

  // Pagination
  currentPage: number = 1;
  perPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Filtres
  searchTerm: string = '';
  roleFilter: string = '';
  statusFilter: string = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchTerm = params['keyword'] || '';
      this.roleFilter = params['role'] || '';
      this.statusFilter = params['is_active'] || true;
      this.currentPage = +params['page'] || 1;

      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.isLoading = true;

    const filters = {
      keyword: this.searchTerm,
      role: this.roleFilter,
      is_active: this.statusFilter,
      page: this.currentPage,
      per_page: this.perPage,
    };

    this.userService.getAllUsers(filters).subscribe({
      next: (response: any) => {
        this.users = response.data;
        this.totalItems = response.total;
        this.totalPages = response.last_page;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
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
      role: this.roleFilter || null,
      is_active: this.statusFilter || null,
      page: this.currentPage !== 1 ? this.currentPage : null,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });

    this.loadUsers();
  }

  toggleUserStatus(user: IUser): void {
    const newStatus = !user.is_active;
    const action = newStatus ? 'activate' : 'deactivate';

    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        user.is_active = newStatus;
        this.toastr.success(`User ${action}d successfully`);
      },
      error: (error) => {
        console.error(`Error ${action}ing user:`, error);
        this.toastr.error(`Failed to ${action} user`);
      },
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'seller':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
