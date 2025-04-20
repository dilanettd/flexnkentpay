import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { handleHttpError } from '../errors';
import { ICategory } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  public addCategory(category: FormData): Observable<ICategory> {
    return this.http
      .post<ICategory>(`${this.apiUrl}/categories`, category)
      .pipe(catchError(handleHttpError));
  }

  public getAllCategories(): Observable<ICategory[]> {
    return this.http
      .get<ICategory[]>(`${this.apiUrl}/categories`)
      .pipe(catchError(handleHttpError));
  }

  public getCategoryById(id: number): Observable<ICategory> {
    return this.http
      .get<ICategory>(`${this.apiUrl}/categories/${id}`)
      .pipe(catchError(handleHttpError));
  }

  public updateCategory(id: number, category: FormData): Observable<ICategory> {
    return this.http
      .put<ICategory>(`${this.apiUrl}/categories/${id}`, category)
      .pipe(catchError(handleHttpError));
  }

  public deleteCategory(id: number): Observable<{}> {
    return this.http
      .delete(`${this.apiUrl}/categories/${id}`)
      .pipe(catchError(handleHttpError));
  }
}
