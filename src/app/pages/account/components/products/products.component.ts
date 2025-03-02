import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../../../core/services/product/product.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { IProduct } from '../../../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'flexnkentpay-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);

  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  loading = false;
  error = false;
  filterStatus = 'all';

  // Propriétés pour la modal de confirmation
  showDeleteModal = false;
  productToDelete: IProduct | null = null;

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.loading = true;
    this.error = false;

    this.productService
      .getUserProducts()
      .pipe(
        finalize(() => (this.loading = false)),
        catchError(() => {
          this.error = true;
          return of([]);
        })
      )
      .subscribe((products) => {
        this.products = products;
        this.applyFilter();
      });
  }

  // Méthode pour ouvrir la modal de confirmation
  confirmDeleteProduct(product: IProduct): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  // Méthode pour annuler la suppression
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  // Méthode pour confirmer la suppression
  confirmDelete(): void {
    if (this.productToDelete) {
      this.deleteProduct(this.productToDelete.id);
      this.showDeleteModal = false;
      this.productToDelete = null;
    }
  }

  deleteProduct(id: number): void {
    this.loading = true;

    this.productService
      .deleteProductById(id)
      .pipe(
        finalize(() => (this.loading = false)),
        catchError(() => {
          this.error = true;
          return of(null);
        })
      )
      .subscribe(() => {
        this.products = this.products.filter((product) => product.id !== id);
        this.applyFilter();
      });
  }

  applyFilter(): void {
    if (this.filterStatus === 'all') {
      this.filteredProducts = this.products;
    } else {
      const isActive = this.filterStatus === 'active';
      this.filteredProducts = this.products.filter(
        (product) => product.is_active === isActive
      );
    }
  }
}
