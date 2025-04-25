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
import { CommonModule } from '@angular/common';
import { ButtonSpinnerComponent } from '../button-spinner/button-spinner.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'flexnkentpay-login-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ButtonSpinnerComponent,
    TranslateModule,
  ],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  errorMessage: string | null = null;
  isSubmitted: boolean = false;
  isForgotPassword: boolean = false;
  loginSubscribe!: Unsubscribable;
  getAuthenticatedUserSubscribe!: Unsubscribable;

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbModal,
    private authService: AuthService,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  showForgotPasswordForm() {
    this.isForgotPassword = true;
  }

  signInWithFB() {}

  signInWithGoogle() {}

  goBackToLogin() {
    this.isForgotPassword = false;
    this.errorMessage = null;
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
          this.authService.setTokens(tokens);

          this.getAuthenticatedUserSubscribe = this.authService
            .getAuthenticatedUser()
            .subscribe({
              next: (me: IUser) => {
                this.authService.setUser(me);
                this.toastr.success(
                  this.translateService.instant('LOGIN.SUCCESS.LOGGED_IN')
                );
                this.activeModal.dismissAll();
              },
              error: () => {
                this.errorMessage = 'LOGIN.ERROR.UNEXPECTED';
              },
            });
        },
        error: (err) => {
          this.isSubmitted = false;
          if (err.status == 401) {
            this.errorMessage = 'LOGIN.ERROR.INCORRECT_CREDENTIALS';
          } else if (err.status == 403) {
            this.errorMessage = 'LOGIN.ERROR.ACCOUNT_BLOCKED';
          } else {
            this.errorMessage = 'LOGIN.ERROR.UNEXPECTED';
          }
        },
      });
    }
  }

  onResetPasswordSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isSubmitted = true;
      const { email } = this.forgotPasswordForm.value;

      this.authService.sendResetPasswordEmail(email).subscribe({
        next: () => {
          this.isSubmitted = false;
          this.toastr.success(
            this.translateService.instant('LOGIN.SUCCESS.RESET_EMAIL_SENT')
          );
          setTimeout(() => {
            this.goBackToLogin();
          }, 3000);
        },
        error: () => {
          this.isSubmitted = false;
          this.errorMessage = 'LOGIN.ERROR.RESET_FAILED';
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
