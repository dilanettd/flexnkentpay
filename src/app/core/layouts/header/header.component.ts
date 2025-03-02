import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth/auth.service';
import { IUser } from '../../models/auth.state.model';
import { LoginModalComponent } from '../../../shared/components/login-modal/login-modal.component';
import { RegisterModalComponent } from '../../../shared/components/register-modal/register-modal.component';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { QrcodeModalComponent } from '../../../shared/components/qrcode-modal/qrcode-modal/qrcode-modal.component';

@Component({
  selector: 'flexnkentpay-header',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        ),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit {
  me: IUser | null | undefined;
  isMenuOpen: boolean = false;
  isMobileMenuOpen: boolean = false;
  isAuthenticated: boolean = false;
  searchKeyword: string = '';
  isSearchVisible: boolean = false;

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
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
    this.isMobileMenuOpen = false;
  }

  openRegisterModal() {
    this.modalService.open(RegisterModalComponent);
    this.isMenuOpen = false;
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
    this.isMobileMenuOpen = false;
  }

  toggleAvatarMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isSearchVisible = false;
      this.isMenuOpen = false;
    }
  }

  toggleSearchBar() {
    this.isSearchVisible = !this.isSearchVisible;
    if (this.isSearchVisible) {
      this.isMobileMenuOpen = false;
      this.isMenuOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const targetElement = event.target as HTMLElement;
    const avatarMenu =
      this.elementRef.nativeElement.querySelector('.avatar-menu');
    const avatarButton =
      this.elementRef.nativeElement.querySelector('.avatar-button');

    if (
      !avatarMenu?.contains(targetElement) &&
      !avatarButton?.contains(targetElement)
    ) {
      this.isMenuOpen = false;
    }
  }

  openQrModal() {
    this.modalService.open(QrcodeModalComponent);
  }

  onSearch() {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/products'], {
        queryParams: {
          searchKeyword: this.searchKeyword,
          currentPage: 1,
          pageSize: 12,
        },
      });
      this.toggleSearchBar();
    }
  }
}
