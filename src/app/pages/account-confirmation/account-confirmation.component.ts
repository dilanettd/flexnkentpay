import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'account-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './account-confirmation.component.html',
  styleUrl: './account-confirmation.component.scss',
})
export class AccountConfirmationComponent {
  message: string = '';
  isSuccess: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (token) {
      this.authService.verifyAccountEmail(token).subscribe({
        next: (res) => {
          this.message = this.translateService.instant(
            'ACCOUNT_CONFIRMATION.SUCCESS_MESSAGE'
          );
          this.toastr.success(this.message);
          this.isSuccess = true;

          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        },
        error: (err) => {
          this.message = this.translateService.instant(
            'ACCOUNT_CONFIRMATION.FAILURE_MESSAGE.FAILED'
          );
          this.toastr.error(this.message);
          this.isSuccess = false;
        },
      });
    } else {
      this.message = this.translateService.instant(
        'ACCOUNT_CONFIRMATION.FAILURE_MESSAGE.INVALID'
      );
      this.toastr.error(this.message);
      this.isSuccess = false;
    }
  }
}
