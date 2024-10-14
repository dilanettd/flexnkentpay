import { Component, HostListener, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth/auth.service';
import { IUser } from '../../models/auth.state.model';
import { LoginModalComponent } from '../../../shared/components/login-modal/login-modal.component';
import { RegisterModalComponent } from '../../../shared/components/register-modal/register-modal.component';
import { RoundedAvatarComponent } from '../../../shared/components/rounded-avatar/rounded-avatar.component';

@Component({
  selector: 'flexnkentpay-header',
  standalone: true,
  imports: [RoundedAvatarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  me: IUser | null = {
    id: '',
    name: '',
    email: '',
    profile_url: '',
    is_email_verified: false,
    is_phone_verified: false,
    is_active: false,
    password: '',
    role: '',
    created_at: '',
    updated_at: '',
  };
  isMenuOpen: boolean = false;

  constructor(
    private modalService: NgbModal,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user: IUser | null) => {
      this.me = user;
    });
  }

  openLoginModal() {
    this.modalService.open(LoginModalComponent);
  }

  openRegisterModal() {
    this.modalService.open(RegisterModalComponent);
  }

  openAccount() {}

  logout() {
    this.authService.logout();
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
}
