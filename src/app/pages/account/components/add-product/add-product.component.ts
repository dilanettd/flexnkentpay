import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'flexnkentpay-add-product',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent {
  step: number = 1; // Initial step
  isHour24: boolean = false; // To manage time selection
  type: string = 'product'; // Default type
  uploadedImages: any[] = []; // Array for uploaded images
  maxImages: number = 5; // Maximum number of images
  isLoading: boolean = false; // For managing loading state during submission

  // Forms for each step
  productForm!: FormGroup;
  step2Form!: FormGroup;
  step3FormProduct!: FormGroup;
  step3FormService!: FormGroup;
  step4Form!: FormGroup;

  // Mock data for categories and subcategories
  categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Furniture' },
  ];
  subcategories = [
    { id: 1, name: 'Phones' },
    { id: 2, name: 'Laptops' },
  ];

  // Days of availability for services
  daysList = [
    { id: 1, nameFr: 'Lundi' },
    { id: 2, nameFr: 'Mardi' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms() {
    // Initialize the forms with validation rules
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      brand: [''],
      category: ['', Validators.required],
      subcategory: [''],
      price: ['', [Validators.required, Validators.min(1)]],
      stockQuantity: ['', Validators.required],
      description: [''],
    });

    this.step2Form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      subCategory: ['', Validators.required],
    });

    this.step3FormProduct = this.fb.group({
      brand: ['', Validators.required],
      price: ['', Validators.required],
      location: ['', Validators.required],
    });

    this.step3FormService = this.fb.group({
      days: ['', Validators.required],
      startTime: [''],
      endTime: [''],
      priceService: ['', Validators.required],
      locationService: ['', Validators.required],
    });

    this.step4Form = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(2000)]],
    });
  }

  // Step navigation functions
  handleNext() {
    if (this.step < 5) {
      this.step++;
    }
  }

  handlePrevious() {
    if (this.step > 1) {
      this.step--;
    }
  }

  handleSubmit() {
    if (this.step === 5) {
      this.isLoading = true;
      // Simulate an API call or submit logic
      setTimeout(() => {
        this.isLoading = false;
        alert('Product submitted successfully!');
      }, 2000);
    }
  }

  // Handle the selection of product or service
  changeType(event: any) {
    this.type = event.target.value;
  }

  // Handle address change
  handleAddressChange(event: any) {
    // Logic for handling address from ngx-google-places-autocomplete
  }

  // Image upload handling
  uploadImage(event: any) {
    const files = event.target.files;
    if (files.length > 0 && this.uploadedImages.length < this.maxImages) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.uploadedImages.push({
            url: e.target.result,
            number: this.uploadedImages.length + 1,
          });
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  closeMadel() {}

  // Delete uploaded image
  deleteImage(image: any) {
    this.uploadedImages = this.uploadedImages.filter((img) => img !== image);
  }

  // Dynamically translate categories based on locale (mock function)
  translateCategory(categoryId: number, locale: string) {
    // Translation logic based on locale
    return this.categories.find((c) => c.id === categoryId)?.name;
  }

  // Dynamically translate subcategories based on locale (mock function)
  translateSubCategory(subCategoryId: number, locale: string) {
    // Translation logic based on locale
    return this.subcategories.find((sc) => sc.id === subCategoryId)?.name;
  }
}
