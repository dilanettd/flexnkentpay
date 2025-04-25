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
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation/translation.service';

@Component({
  selector: 'flexnkentpay-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    FormsModule,
    CommonModule,
    TranslateModule,
  ],
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
  currentLang: string = 'fr';

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user: IUser | null) => {
      this.isAuthenticated = this.authService.isAuthenticate();
      this.me = user;
    });

    this.translationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  changeLanguage(lang: string): void {
    this.translationService.setLanguage(lang);
    this.isMenuOpen = false;
    this.isMobileMenuOpen = false;
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

    // Toggle body class to prevent scrolling when menu is open
    if (this.isMobileMenuOpen) {
      document.body.classList.add('menu-open');
      this.isSearchVisible = false;
      this.isMenuOpen = false;
    } else {
      document.body.classList.remove('menu-open');
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

    // Check if click is outside avatar menu
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

    // Check if click is outside mobile menu
    const mobileMenu =
      this.elementRef.nativeElement.querySelector('.mobile-menu');
    const mobileMenuButton = this.elementRef.nativeElement.querySelector(
      '.mobile-menu-button'
    );
    if (
      this.isMobileMenuOpen &&
      !mobileMenu?.contains(targetElement) &&
      !mobileMenuButton?.contains(targetElement)
    ) {
      this.isMobileMenuOpen = false;
      document.body.classList.remove('menu-open');
    }
  }

  // Close mobile menu when navigating
  closeMenu() {
    this.isMobileMenuOpen = false;
    this.isMenuOpen = false;
    document.body.classList.remove('menu-open');
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
