import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user/user.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ButtonSpinnerComponent } from '../button-spinner/button-spinner.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'flexnkentpay-review-shop',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ButtonSpinnerComponent,
    TranslateModule,
  ],
  templateUrl: './review-shop.component.html',
  styleUrl: './review-shop.component.scss',
})
export class ReviewShopComponent implements OnDestroy {
  @Input({ required: true }) shopId!: number;
  @Output() reviewSubmitted = new EventEmitter<void>();

  reviewForm!: FormGroup;
  isSubmitted: boolean = false;
  hoverRating: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private userService: UserService,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, Validators.required],
      review: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  getRatingText(rating: number): string {
    switch (rating) {
      case 5:
        return this.translateService.instant('SHOP_REVIEW.RATING.EXCELLENT');
      case 4:
        return this.translateService.instant('SHOP_REVIEW.RATING.VERY_GOOD');
      case 3:
        return this.translateService.instant('SHOP_REVIEW.RATING.GOOD');
      case 2:
        return this.translateService.instant('SHOP_REVIEW.RATING.FAIR');
      case 1:
        return this.translateService.instant('SHOP_REVIEW.RATING.POOR');
      default:
        return '';
    }
  }

  submitReview() {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.isSubmitted = true;
    const reviewData = this.reviewForm.value;

    if (this.shopId) {
      reviewData.shop_id = this.shopId;

      const reviewSub = this.userService.reviewShop(reviewData).subscribe({
        next: () => {
          this.toastr.success(
            this.translateService.instant('SHOP_REVIEW.SUCCESS.SUBMITTED')
          );
          this.reviewSubmitted.emit();
          this.isSubmitted = false;
          this.closeModal();
        },
        error: () => {
          this.toastr.error(
            this.translateService.instant('SHOP_REVIEW.ERROR_MESSAGE')
          );
          this.isSubmitted = false;
        },
      });

      this.subscription.add(reviewSub);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
