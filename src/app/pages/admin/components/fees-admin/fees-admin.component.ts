import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { OrderService } from '../../../../core/services/order/order.service';
import { IFee } from '../../../../core/models/product.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'flexnkentpay-fees-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './fees-admin.component.html',
  styleUrl: './fees-admin.component.scss',
})
export class FeesAdminComponent implements OnInit {
  // Fees arrays
  orderFees: IFee[] = [];
  penaltyFees: IFee[] = [];
  activeFees: { order_fee: IFee | null; penalty_fee: IFee | null } = {
    order_fee: null,
    penalty_fee: null,
  };

  // Loading states
  isLoading: boolean = true;
  isSaving: boolean = false;
  isDeleting: boolean = false;

  // Modal states
  showFeeModal: boolean = false;
  showDeleteModal: boolean = false;
  editingFee: IFee | null = null;
  feeToDelete: IFee | null = null;
  currentFeeType: 'order' | 'penalty' = 'order';

  // Form
  feeForm: FormGroup;
  formSubmitted: boolean = false;

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.feeForm = this.fb.group({
      name: ['', Validators.required],
      type: ['order', Validators.required],
      percentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      is_active: [true],
    });
  }

  ngOnInit(): void {
    this.loadFees();
    this.loadActiveFees();
  }

  loadFees(): void {
    this.isLoading = true;

    this.orderService.getAllFees().subscribe({
      next: (fees) => {
        // Separate fees by type
        this.orderFees = fees.filter((fee) => fee.type === 'order');
        this.penaltyFees = fees.filter((fee) => fee.type === 'penalty');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading fees:', error);
        this.toastr.error('Failed to load fees');
        this.isLoading = false;
      },
    });
  }

  loadActiveFees(): void {
    this.orderService.getActiveFees().subscribe({
      next: (response) => {
        this.activeFees = response;
      },
      error: (error) => {
        console.error('Error loading active fees:', error);
      },
    });
  }

  openFeeModal(type: 'order' | 'penalty', fee?: IFee): void {
    this.formSubmitted = false;
    this.currentFeeType = type;

    if (fee) {
      this.editingFee = fee;
      this.feeForm.patchValue({
        name: fee.name,
        type: fee.type,
        percentage: fee.percentage,
        is_active: fee.is_active,
      });
    } else {
      this.editingFee = null;
      this.feeForm.patchValue({
        name: '',
        type: type,
        percentage: 0,
        is_active: true,
      });
    }

    this.showFeeModal = true;
  }

  saveFee(): void {
    this.formSubmitted = true;

    if (this.feeForm.invalid) {
      return;
    }

    this.isSaving = true;
    const formData = this.feeForm.value;

    if (this.editingFee) {
      // Update existing fee
      this.orderService.updateFee(this.editingFee.type, formData).subscribe({
        next: (updatedFee) => {
          this.updateFeeInList(updatedFee);
          this.toastr.success('Fee updated successfully');
          this.showFeeModal = false;
          this.isSaving = false;
          this.loadActiveFees();
        },
        error: (error) => {
          console.error('Error updating fee:', error);
          this.toastr.error('Failed to update fee');
          this.isSaving = false;
        },
      });
    } else {
      // Create new fee
      this.orderService.createFee(formData).subscribe({
        next: (newFee) => {
          if (newFee.type === 'order') {
            this.orderFees.push(newFee);
          } else {
            this.penaltyFees.push(newFee);
          }
          this.toastr.success('Fee created successfully');
          this.showFeeModal = false;
          this.isSaving = false;
          this.loadActiveFees();
        },
        error: (error) => {
          console.error('Error creating fee:', error);
          this.toastr.error('Failed to create fee');
          this.isSaving = false;
        },
      });
    }
  }

  activateFee(fee: IFee): void {
    this.orderService.activateFee(fee.type).subscribe({
      next: (activatedFee) => {
        this.updateFeeInList(activatedFee);
        this.toastr.success(`${activatedFee.name} has been activated`);
        this.loadActiveFees();
      },
      error: (error) => {
        console.error('Error activating fee:', error);
        this.toastr.error('Failed to activate fee');
      },
    });
  }

  confirmDeleteFee(fee: IFee): void {
    this.feeToDelete = fee;
    this.showDeleteModal = true;
  }

  deleteFee(): void {
    if (!this.feeToDelete) {
      return;
    }

    this.isDeleting = true;

    this.orderService.deleteFee(this.feeToDelete.type).subscribe({
      next: () => {
        if (this.feeToDelete!.type === 'order') {
          this.orderFees = this.orderFees.filter(
            (f) => f.type !== this.feeToDelete!.type
          );
        } else {
          this.penaltyFees = this.penaltyFees.filter(
            (f) => f.type !== this.feeToDelete!.type
          );
        }
        this.toastr.success('Fee deleted successfully');
        this.showDeleteModal = false;
        this.isDeleting = false;
        this.loadActiveFees();
      },
      error: (error) => {
        console.error('Error deleting fee:', error);
        this.toastr.error(
          'Failed to delete fee' +
            (error.error?.message ? ': ' + error.error.message : '')
        );
        this.isDeleting = false;
      },
    });
  }

  updateFeeInList(updatedFee: IFee): void {
    if (updatedFee.type === 'order') {
      const index = this.orderFees.findIndex((f) => f.type === updatedFee.type);
      if (index !== -1) {
        this.orderFees[index] = updatedFee;
      }

      // Update active status for all order fees
      if (updatedFee.is_active) {
        this.orderFees.forEach((f) => {
          if (f.type !== updatedFee.type) {
            f.is_active = false;
          }
        });
      }
    } else {
      const index = this.penaltyFees.findIndex(
        (f) => f.type === updatedFee.type
      );
      if (index !== -1) {
        this.penaltyFees[index] = updatedFee;
      }

      // Update active status for all penalty fees
      if (updatedFee.is_active) {
        this.penaltyFees.forEach((f) => {
          if (f.type !== updatedFee.type) {
            f.is_active = false;
          }
        });
      }
    }
  }
}
