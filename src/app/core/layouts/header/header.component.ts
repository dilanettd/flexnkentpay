import { Component, HostListener, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth/auth.service';
import { IUser } from '../../models/auth.state.model';
import { LoginModalComponent } from '../../../shared/components/login-modal/login-modal.component';
import { RegisterModalComponent } from '../../../shared/components/register-modal/register-modal.component';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'flexnkentpay-header',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit {
  me: IUser | null | undefined;
  isMenuOpen: boolean = false;
  isAuthenticated: boolean = true;
  searchKeyword: string = '';
  category: string = '';
  currentPage: number = 1;
  pageSize: number = 12;
  isSearchVisible = false;

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user: IUser | null) => {
      this.isAuthenticated = this.authService.isAuthenticate();
      this.me = user;
    });
  }

  openLoginModal() {
    this.modalService.open(LoginModalComponent);
    this.isMenuOpen = false;
  }

  openRegisterModal() {
    this.modalService.open(RegisterModalComponent);
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  toggleAvatarMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInsideMenu =
      target.closest('.avatar-menu') || target.closest('.avatar-container');

    if (!clickedInsideMenu) {
      this.isMenuOpen = false;
    }
  }

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.category = selectElement.value;
  }

  toggleSearchBar(): void {
    this.isSearchVisible = !this.isSearchVisible;
  }

  onSearch() {
    this.router.navigate(['/products'], {
      queryParams: {
        searchKeyword: this.searchKeyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        category: this.category,
      },
    });
    this.toggleSearchBar();
  }
}
