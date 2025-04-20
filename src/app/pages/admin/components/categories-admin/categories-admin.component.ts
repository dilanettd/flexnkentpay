import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CategoryService } from '../../../../core/services/category/category.service';
import { ICategory } from '../../../../core/models/product.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'flexnkentpay-categories-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categories-admin.component.html',
  styleUrl: './categories-admin.component.scss',
})
export class CategoriesAdminComponent implements OnInit {
  categories: ICategory[] = [];
  filteredCategories: ICategory[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';

  // Modal states
  showCategoryModal: boolean = false;
  showDeleteModal: boolean = false;
  editingCategory: ICategory | null = null;
  categoryToDelete: ICategory | null = null;

  // Form states
  categoryForm: FormGroup;
  formSubmitted: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;

    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filteredCategories = [...categories];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastr.error('Failed to load categories');
        this.isLoading = false;
      },
    });
  }

  filterCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories];
      return;
    }

    const search = this.searchTerm.toLowerCase().trim();
    this.filteredCategories = this.categories.filter(
      (category) =>
        category.name.toLowerCase().includes(search) ||
        (category.description &&
          category.description.toLowerCase().includes(search))
    );
  }

  openCategoryModal(category?: ICategory): void {
    this.formSubmitted = false;

    if (category) {
      this.editingCategory = category;
      this.categoryForm.patchValue({
        name: category.name,
        description: category.description || '',
      });
    } else {
      this.editingCategory = null;
      this.categoryForm.reset();
    }

    this.showCategoryModal = true;
  }

  saveCategory(): void {
    this.formSubmitted = true;

    if (this.categoryForm.invalid) {
      return;
    }

    this.isSaving = true;
    const formData = this.categoryForm.value;

    if (this.editingCategory) {
      // Update existing category
      this.categoryService
        .updateCategory(this.editingCategory.id!, formData)
        .subscribe({
          next: (updatedCategory) => {
            const index = this.categories.findIndex(
              (c) => c.id === this.editingCategory!.id
            );
            if (index !== -1) {
              this.categories[index] = updatedCategory;
              this.filterCategories();
            }
            this.toastr.success('Category updated successfully');
            this.showCategoryModal = false;
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error updating category:', error);
            this.toastr.error('Failed to update category');
            this.isSaving = false;
          },
        });
    } else {
      // Create new category
      this.categoryService.addCategory(formData).subscribe({
        next: (newCategory) => {
          this.categories.push(newCategory);
          this.filterCategories();
          this.toastr.success('Category created successfully');
          this.showCategoryModal = false;
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.toastr.error('Failed to create category');
          this.isSaving = false;
        },
      });
    }
  }

  confirmDeleteCategory(category: ICategory): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  deleteCategory(): void {
    if (!this.categoryToDelete || !this.categoryToDelete.id) {
      return;
    }

    this.isDeleting = true;

    this.categoryService.deleteCategory(this.categoryToDelete.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(
          (c) => c.id !== this.categoryToDelete!.id
        );
        this.filterCategories();
        this.toastr.success('Category deleted successfully');
        this.showDeleteModal = false;
        this.isDeleting = false;
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.toastr.error('Failed to delete category');
        this.isDeleting = false;
      },
    });
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
