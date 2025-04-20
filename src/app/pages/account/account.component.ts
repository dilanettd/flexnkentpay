import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { IUser } from '../../core/models/auth.state.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'flexnkentpay-account',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  me: IUser | null | undefined;
  userRole: string = 'customer';

  ngOnInit(): void {
    this.authService.getUser().subscribe((user: IUser | null) => {
      this.me = user;
      this.userRole = user?.role || 'customer';
    });
  }

  getUserInitials(): string {
    if (!this.me?.name) return 'U';

    const nameParts = this.me.name.split(' ');

    if (nameParts.length >= 2) {
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    } else {
      return (nameParts[0][0] + (nameParts[0][1] || 'X')).toUpperCase();
    }
  }

  isActiveRoute(route: string): boolean {
    return this.router.isActive(route, true);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
