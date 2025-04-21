import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  IProduct,
  IProductImage,
  IProductReview,
  IShopReview,
  IUpdateProduct,
} from '../../models/product.model';
import { catchError, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { handleHttpError } from '../errors';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  // Add a new product
  public addProduct(product: FormData): Observable<IProduct> {
    return this.http
      .post<IProduct>(`${this.apiUrl}/product`, product)
      .pipe(catchError(handleHttpError));
  }

  // Update a product by ID
  public updateProduct(
    id: number,
    product: IUpdateProduct
  ): Observable<IProduct> {
    return this.http
      .put<IProduct>(`${this.apiUrl}/product/${id}`, product)
      .pipe(catchError(handleHttpError));
  }

  public deleteProductImage(imageId: number): Observable<{}> {
    return this.http
      .delete<{}>(`${this.apiUrl}/product-images/${imageId}`)
      .pipe(catchError(handleHttpError));
  }

  // Add images to a specific product
  public addImageToProduct(image: FormData): Observable<IProductImage> {
    return this.http
      .post<IProductImage>(`${this.apiUrl}/product-images`, image)
      .pipe(catchError(handleHttpError));
  }

  // Retrieve all products for a specific user
  public getUserProducts(): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${this.apiUrl}/products`)
      .pipe(catchError(handleHttpError));
  }

  // Search products with query parameters for keyword, category, page, and limit
  public searchProducts(params: {
    keyword?: string;
    page?: number;
    limit?: number;
    category?: string;
  }): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/products/search`, { params })
      .pipe(catchError(handleHttpError));
  }

  // Add to existing ProductService in src/app/core/services/product/product.service.ts

  /**
   * Get top categories with the most products
   *
   * @param limit Optional limit parameter (default: 5)
   * @returns Observable with top categories
   */
  public getTopCategories(limit: number = 5): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/categories/top`, {
        params: { limit: limit.toString() },
      })
      .pipe(catchError(handleHttpError));
  }

  /**
   * Get products by category
   *
   * @param category Category name
   * @param limit Optional limit parameter (default: 4)
   * @returns Observable with products in the category
   */
  public getProductsByCategory(
    category: string,
    limit: number = 4
  ): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${this.apiUrl}/products/search`, {
        params: {
          category: category,
          limit: limit.toString(),
        },
      })
      .pipe(catchError(handleHttpError));
  }

  //Get top categories with their products in a single request
  public getTopCategoriesWithProducts(
    categoryLimit: number = 5,
    productLimit: number = 10
  ): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/categories/top-with-products`, {
        params: {
          categoryLimit: categoryLimit.toString(),
          productLimit: productLimit.toString(),
        },
      })
      .pipe(catchError(handleHttpError));
  }

  // Get product using the QR code
  public getProductByCode(code: string): Observable<IProduct> {
    return this.http
      .get<IProduct>(`${this.apiUrl}/products/code/${code}`)
      .pipe(catchError(handleHttpError));
  }

  // Retrieve a specific product by ID
  public getProductById(id: number): Observable<IProduct> {
    return this.http
      .get<IProduct>(`${this.apiUrl}/product/${id}`)
      .pipe(catchError(handleHttpError));
  }

  // Delete a product by ID
  public deleteProductById(id: number): Observable<{}> {
    return this.http
      .delete<{}>(`${this.apiUrl}/product/${id}`)
      .pipe(catchError(handleHttpError));
  }

  // Increment views for a product
  public incrementViewsProduct(productId: number): Observable<number> {
    return this.http
      .post<number>(`${this.apiUrl}/products/${productId}/increment-views`, {})
      .pipe(catchError(handleHttpError));
  }

  // Get recent products
  public getRecentProducts(): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${this.apiUrl}/products/recent`)
      .pipe(catchError(handleHttpError));
  }

  // Get related products by ID
  public getRelatedProducts(productId: number): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${this.apiUrl}/products/${productId}/related`)
      .pipe(catchError(handleHttpError));
  }

  // Retrieve all products for a specific shop by shopId
  public getProductsByShopId(shopId: number): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${this.apiUrl}/shops/${shopId}/products`)
      .pipe(catchError(handleHttpError));
  }

  // Retrieve all reviews for a specific product by productId
  public getProductReviews(productId: number): Observable<IProductReview[]> {
    return this.http
      .get<IProductReview[]>(`${this.apiUrl}/product-reviews/${productId}`)
      .pipe(catchError(handleHttpError));
  }

  // Retrieve all reviews for a specific shop by shopId
  public getShopReviews(shopId: number): Observable<IShopReview[]> {
    return this.http
      .get<IShopReview[]>(`${this.apiUrl}/shop-reviews/${shopId}`)
      .pipe(catchError(handleHttpError));
  }

  // Increment views for a shop
  public incrementShopVisit(shopId: number): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/shop/${shopId}/increment-visit`, {})
      .pipe(catchError(handleHttpError));
  }

  // Retrieve products for admin with filtering
  public getAdminProducts(filters: {
    search?: string;
    page: number;
    pageSize: number;
  }): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/admin/products`, { params: filters })
      .pipe(catchError(handleHttpError));
  }

  public toggleProductActive(productId: number): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/admin/products/${productId}/toggle`, {})
      .pipe(catchError(handleHttpError));
  }
}
