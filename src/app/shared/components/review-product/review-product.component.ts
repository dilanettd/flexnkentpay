import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { UserService } from '../../../core/services/user/user.service';
import { CommonModule } from '@angular/common';
import { ButtonSpinnerComponent } from '../button-spinner/button-spinner.component';

@Component({
  selector: 'flexnkentpay-review-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ButtonSpinnerComponent],
  templateUrl: './review-product.component.html',
  styleUrl: './review-product.component.scss',
})
export class ReviewProductComponent {
  @Input({ required: true }) productId!: number;
  @Output() reviewSubmitted = new EventEmitter<void>();

  reviewForm!: FormGroup;
  isSubmitted: boolean = false;
  hoverRating: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private userService: UserService,
    private toastr: ToastrService
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
        return 'Excellent';
      case 4:
        return 'Very Good';
      case 3:
        return 'Good';
      case 2:
        return 'Fair';
      case 1:
        return 'Poor';
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

    if (this.productId) {
      reviewData.product_id = this.productId;

      const reviewSub = this.userService.reviewProduct(reviewData).subscribe({
        next: () => {
          this.toastr.success('Your review has been successfully submitted.');
          this.reviewSubmitted.emit();
          this.isSubmitted = false;
          this.closeModal();
        },
        error: () => {
          this.toastr.error('An error occurred. Please try again.');
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
