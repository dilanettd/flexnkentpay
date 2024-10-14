import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IUser } from '../../../core/models/auth.state.model';
import { Unsubscribable } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'flexnkentpay-login-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  isSubmitted: boolean = false;
  loginSubscribe!: Unsubscribable;
  getAuthenticatedUserSubscribe!: Unsubscribable;

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbModal,
    private authService: AuthService,
    private toastr: ToastrService,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
    });
  }

  closeModal() {
    this.activeModal.dismissAll();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitted = true;
      const { email, password } = this.loginForm.value;

      this.loginSubscribe = this.authService.login(email, password).subscribe({
        next: (tokens) => {
          this.isSubmitted = false;
          // Store the tokens in localStorage
          this.localStorage.store('accessToken', tokens.access_token);
          this.localStorage.store('refreshToken', tokens.refresh_token);

          this.getAuthenticatedUserSubscribe = this.authService
            .getAuthenticatedUser()
            .subscribe({
              next: (me: IUser) => {
                // Store the authenticated user in localStorage
                this.localStorage.store('me', me);
                this.toastr.success('You are successfully logged in.');
                this.activeModal.dismissAll();
              },
              error: () => {
                this.errorMessage = 'Something unexpected happened';
              },
            });
        },
        error: (err) => {
          this.isSubmitted = false;
          if (err.status == 401) {
            this.errorMessage = 'Incorrect email or password';
          } else if (err.status == 403) {
            this.errorMessage = 'Your account has been blocked';
          } else {
            this.errorMessage = 'Something unexpected happened';
          }
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.getAuthenticatedUserSubscribe) {
      this.getAuthenticatedUserSubscribe.unsubscribe();
    }
    if (this.loginSubscribe) {
      this.loginSubscribe.unsubscribe();
    }
  }
}
