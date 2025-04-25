import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
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
import { finalize } from 'rxjs';
import {
  ICategory,
  IProduct,
  IUpdateProduct,
} from '../../../../core/models/product.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'flexnkentpay-update-product',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonSpinnerComponent,
    TranslateModule,
  ],
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.scss'],
})
export class UpdateProductComponent implements OnInit {
  @Input() product!: IProduct;

  step: number = 1;
  maxStep: number = 4;
  uploadedImages: { url: string; file: File | null; id?: number }[] = [];
  maxImages: number = 5;
  isLoading: boolean = false;
  categories: ICategory[] = [];
  isLoadingCategories: boolean = false;
  errorMessage: string = '';
  deletedImageIds: number[] = [];
  hasImagesChanged: boolean = false;

  productForm!: FormGroup;

  private fb = inject(FormBuilder);
  private imageCompress = inject(NgxImageCompressService);
  private toastr = inject(ToastrService);
  private activeModal = inject(NgbActiveModal);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private translateService = inject(TranslateService);

  constructor() {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadCategories();
    this.loadProductImages();
  }

  initializeForms() {
    this.productForm = this.fb.group({
      name: [
        this.product.name,
        [Validators.required, Validators.maxLength(100)],
      ],
      brand: [
        this.product.brand || '',
        [Validators.required, Validators.maxLength(50)],
      ],
      category: [this.product.category, Validators.required],
      price: [this.product.price, [Validators.required, Validators.min(1)]],
      stock_quantity: [
        this.product.stock_quantity,
        [Validators.required, Validators.min(0)],
      ],
      description: [
        this.product.description || '',
        [Validators.required, Validators.minLength(20)],
      ],
      currency: [this.product.currency, Validators.required],
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

  loadProductImages() {
    if (this.product && this.product.images && this.product.images.length > 0) {
      this.product.images.forEach((image) => {
        this.uploadedImages.push({
          url: image.image_url,
          file: null,
          id: image.id,
        });
      });
    }
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
        this.translateService.instant('ADD_PRODUCT.MESSAGES.VALIDATION')
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
      const updateData: IUpdateProduct = {
        name: this.productForm.value.name,
        brand: this.productForm.value.brand,
        category: this.productForm.value.category,
        description: this.productForm.value.description,
        currency: this.productForm.value.currency,
        price: this.productForm.value.price,
        stock_quantity: this.productForm.value.stock_quantity,
      };

      await this.productService
        .updateProduct(this.product.id, updateData)
        .toPromise();

      if (this.hasImagesChanged) {
        const deleteImageRequests = this.deletedImageIds.map((imageId) =>
          this.productService.deleteProductImage(imageId).toPromise()
        );

        // Add new images
        const newImages = this.uploadedImages.filter(
          (img) => img.file !== null
        );
        if (newImages.length > 0) {
          const resizedFiles = await this.resizeImages(newImages);

          const uploadRequests = resizedFiles.map((file) => {
            const formData = new FormData();
            formData.append('product_id', this.product.id.toString());
            formData.append('images', file);
            return this.productService.addImageToProduct(formData).toPromise();
          });

          // Wait for all image operations to complete
          await Promise.all([...deleteImageRequests, ...uploadRequests]);
        } else {
          // Just handle deletions if there are no new images
          if (deleteImageRequests.length > 0) {
            await Promise.all(deleteImageRequests);
          }
        }
      }

      this.toastr.success(
        this.translateService.instant('UPDATE_PRODUCT.MESSAGES.SUCCESS')
      );
      this.activeModal.close();
    } catch (error) {
      console.error('Error updating product:', error);
      this.toastr.error(
        this.translateService.instant('UPDATE_PRODUCT.MESSAGES.ERROR')
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
        this.hasImagesChanged = true;
      };
      reader.readAsDataURL(file);
    });
  }

  deleteImage(image: any) {
    // If image has an id, it's an existing image that needs to be deleted from the server
    if (image.id) {
      this.deletedImageIds.push(image.id);
    }

    this.uploadedImages = this.uploadedImages.filter((img) => img !== image);
    this.hasImagesChanged = true;
  }

  async resizeImages(
    files: { url: string; file: File | null; id?: number }[]
  ): Promise<File[]> {
    const resizedFiles: File[] = [];

    for (const fileObj of files) {
      if (fileObj.file) {
        try {
          const file = await this.resizeImageFromUrl(fileObj.url);
          resizedFiles.push(file);
        } catch (error) {
          console.error('Error compressing image:', error);
        }
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
