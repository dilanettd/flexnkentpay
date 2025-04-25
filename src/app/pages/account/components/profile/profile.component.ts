import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { IUser } from '../../../../core/models/auth.state.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserService } from '../../../../core/services/user/user.service';
import { ButtonSpinnerComponent } from '../../../../shared/components/button-spinner/button-spinner.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'flexnkentpay-profile',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonSpinnerComponent,
    TranslateModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileUrl: string | ArrayBuffer | null = 'assets/images/avatars/avatar.jpg';
  profileForm!: FormGroup;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  me: IUser | null | undefined;
  userRole: string = 'customer';
  memberSince: string = new Date().toISOString();
  selectedProfileFile: File | null = null;
  private subscriptions: Subscription = new Subscription();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  private translateService = inject(TranslateService);

  ngOnInit(): void {
    this.profileFormInit();

    const userSubscription = this.authService
      .getUser()
      .subscribe((user: IUser | null) => {
        this.me = user;
        this.userRole = user?.role || 'customer';

        if (user?.profile_url) {
          this.profileUrl = user.profile_url;
        }

        if (user?.created_at) {
          this.memberSince = user.created_at;
        }

        if (this.me) {
          this.profileForm.patchValue({
            email: this.me.email,
            phone: this.me.phone,
            name: this.me.name,
          });
        }
      });
    this.subscriptions.add(userSubscription);
  }

  profileFormInit() {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(9)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  changeProfileImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedProfileFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfileImage() {
    if (this.selectedProfileFile) {
      this.isLoading = true;
      const saveProfileSubscription = this.userService
        .updateProfilePicture(this.selectedProfileFile)
        .subscribe({
          next: (me) => {
            this.toastr.success(
              this.translateService.instant('PROFILE.MESSAGES.UPLOAD_SUCCESS')
            );
            this.authService.setUser(me);
            if (me.profile_url) this.profileUrl = me.profile_url;
            this.isLoading = false;
            this.selectedProfileFile = null;
          },
          error: (err) => {
            this.isLoading = false;
            const errorMessage =
              err.error?.message ||
              this.translateService.instant('PROFILE.MESSAGES.UPLOAD_ERROR');
            this.toastr.error(errorMessage);
          },
        });
      this.subscriptions.add(saveProfileSubscription);
    } else {
      this.toastr.warning(
        this.translateService.instant('PROFILE.MESSAGES.SELECT_IMAGE')
      );
    }
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const { email, phone, name } = this.profileForm.value;
      const userUpdateData = { email, phone, name };

      const updateProfileSubscription = this.userService
        .updateProfile(userUpdateData)
        .subscribe({
          next: (me: IUser) => {
            this.toastr.success(
              this.translateService.instant(
                'PROFILE.MESSAGES.PROFILE_UPDATE_SUCCESS'
              )
            );
            this.authService.setUser(me);
            this.isLoading = false;
            this.isEditMode = false;
          },
          error: (err) => {
            this.isLoading = false;
            const errorMessage =
              err.error?.message ||
              this.translateService.instant(
                'PROFILE.MESSAGES.PROFILE_UPDATE_ERROR'
              );
            this.toastr.error(errorMessage);
          },
        });
      this.subscriptions.add(updateProfileSubscription);
    } else {
      this.validateAllFormFields(this.profileForm);
    }
  }

  togglePasswordSection() {
    this.toastr.info(
      this.translateService.instant('PROFILE.MESSAGES.PASSWORD_FEATURE')
    );
  }

  validateAllFormFields(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  get f() {
    return this.profileForm.controls;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
