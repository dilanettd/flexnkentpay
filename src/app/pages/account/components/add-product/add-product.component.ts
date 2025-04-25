import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../../../core/services/product/product.service';
import { CategoryService } from '../../../../core/services/category/category.service';
import { ButtonSpinnerComponent } from '../../../../shared/components/button-spinner/button-spinner.component';
import { finalize } from 'rxjs/operators';
import { ICategory } from '../../../../core/models/product.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'flexnkentpay-add-product',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonSpinnerComponent,
    TranslateModule,
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
})
export class AddProductComponent implements OnInit {
  step: number = 1;
  uploadedImages: { url: string; file: File }[] = [];
  maxImages: number = 5;
  isLoading: boolean = false;
  categories: ICategory[] = [];
  isLoadingCategories: boolean = false;
  errorMessage: string = '';

  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private imageCompress: NgxImageCompressService,
    private toastr: ToastrService,
    private activeModal: NgbActiveModal,
    private productService: ProductService,
    private categoryService: CategoryService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadCategories();
  }

  initializeForms() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      brand: ['', [Validators.required, Validators.maxLength(50)]],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      stock_quantity: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      currency: ['XAF', Validators.required],
    });
  }

  loadCategories() {
    this.isLoadingCategories = true;
    this.categoryService
      .getAllCategories()
      .pipe(finalize(() => (this.isLoadingCategories = false)))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          this.errorMessage = this.translateService.instant(
            'ADD_PRODUCT.MESSAGES.LOAD_CATEGORIES_ERROR'
          );
          this.toastr.error(
            this.translateService.instant(
              'ADD_PRODUCT.MESSAGES.LOAD_CATEGORIES_ERROR'
            ),
            'Error'
          );
        },
      });
  }

  getStepName(stepNumber: number): string {
    switch (stepNumber) {
      case 1:
        return this.translateService.instant('ADD_PRODUCT.STEPS.INFORMATION');
      case 2:
        return this.translateService.instant('ADD_PRODUCT.STEPS.DETAILS');
      case 3:
        return this.translateService.instant('ADD_PRODUCT.STEPS.DESCRIPTION');
      case 4:
        return this.translateService.instant('ADD_PRODUCT.STEPS.IMAGES');
      default:
        return '';
    }
  }

  handleNext() {
    if (this.step === 1) {
      if (this.validateStep(1)) {
        this.step++;
      }
    } else if (this.step === 2) {
      if (this.validateStep(2)) {
        this.step++;
      }
    } else if (this.step === 3) {
      if (this.validateStep(3)) {
        this.step++;
      }
    } else {
      this.validateCurrentStep();
    }
  }

  validateStep(stepNumber: number): boolean {
    let valid = true;

    switch (stepNumber) {
      case 1:
        ['name', 'brand', 'category'].forEach((field) => {
          const control = this.productForm.get(field);
          if (control?.invalid) {
            control.markAsTouched();
            valid = false;
          }
        });
        break;
      case 2:
        ['price', 'stock_quantity'].forEach((field) => {
          const control = this.productForm.get(field);
          if (control?.invalid) {
            control.markAsTouched();
            valid = false;
          }
        });
        break;
      case 3:
        if (this.productForm.get('description')?.invalid) {
          this.productForm.get('description')?.markAsTouched();
          valid = false;
        }
        break;
    }

    if (!valid) {
      this.toastr.warning(
        this.translateService.instant('ADD_PRODUCT.MESSAGES.VALIDATION'),
        'Validation'
      );
    }

    return valid;
  }

  validateCurrentStep() {
    this.validateStep(this.step);
  }

  handlePrevious() {
    if (this.step > 1) {
      this.step--;
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  async handleSubmit() {
    if (this.uploadedImages.length < 2) {
      this.toastr.error(
        this.translateService.instant('ADD_PRODUCT.MESSAGES.MIN_IMAGES')
      );
      return;
    }

    if (!this.productForm.valid) {
      this.validateAllFormFields(this.productForm);
      this.toastr.error(
        this.translateService.instant('ADD_PRODUCT.MESSAGES.FORM_ERRORS')
      );
      return;
    }

    this.isLoading = true;

    try {
      const files = await this.resizeImages(this.uploadedImages);
      const formData = new FormData();
      const product = this.productForm.value;

      // Append product data to formData
      Object.keys(product).forEach((key) => {
        formData.append(key, product[key]);
      });

      // Append images to formData
      files.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      await this.productService.addProduct(formData).toPromise();
      this.toastr.success(
        this.translateService.instant('ADD_PRODUCT.MESSAGES.SUCCESS')
      );
      this.activeModal.close();
    } catch (error) {
      console.error('Error submitting product:', error);
      this.toastr.error(
        this.translateService.instant('ADD_PRODUCT.MESSAGES.ERROR')
      );
    } finally {
      this.isLoading = false;
    }
  }

  uploadImage(event: any) {
    const files: FileList = event.target.files;

    if (!files || files.length === 0) return;

    if (files.length + this.uploadedImages.length > this.maxImages) {
      this.toastr.warning(
        this.translateService.instant('ADD_PRODUCT.MESSAGES.MAX_IMAGES', {
          max: this.maxImages,
        })
      );
      return;
    }

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        this.toastr.error(
          this.translateService.instant('ADD_PRODUCT.MESSAGES.INVALID_FORMAT', {
            name: file.name,
          })
        );
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error(
          this.translateService.instant('ADD_PRODUCT.MESSAGES.MAX_SIZE', {
            name: file.name,
          })
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedImages.push({
          url: e.target.result,
          file: file,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  deleteImage(image: any) {
    this.uploadedImages = this.uploadedImages.filter((img) => img !== image);
  }

  async resizeImages(files: { url: string; file: File }[]): Promise<File[]> {
    const resizedFiles: File[] = [];

    for (const fileObj of files) {
      try {
        const file = await this.resizeImageFromUrl(fileObj.url);
        resizedFiles.push(file);
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }

    return resizedFiles;
  }

  private resizeImageFromUrl(url: string): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      // Extract base64 data
      const base64Data = url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([byteNumbers], { type: 'image/jpeg' });
      const fileName = `image_${Date.now()}.jpg`;

      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target) {
          const base64Image = event.target.result as string;

          try {
            const result = await this.imageCompress.compressFile(
              base64Image,
              1, // orientation
              80, // quality
              80, // ratio
              1200, // max width
              1200 // max height
            );
            const compressedFile = this.base64toFile(
              result,
              fileName,
              'image/jpeg'
            );
            resolve(compressedFile);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('File reading failed.'));
        }
      };

      reader.readAsDataURL(blob);
    });
  }

  private base64toFile(
    base64: string,
    filename: string,
    mimeType: string
  ): File {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new File([ab], filename, { type: mimeType });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}
