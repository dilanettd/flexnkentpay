import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { handleHttpError } from '../errors';
import { IUpdateMe } from '../../models/user.model';
import { IPaginatedUsers } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  updateProfile(user: IUpdateMe): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/user/profile`, user)
      .pipe(catchError(handleHttpError));
  }

  updateUserStatus(userId: string, isActive: boolean): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/admin/users/${userId}/status`, {
        is_active: isActive,
      })
      .pipe(catchError(handleHttpError));
  }

  getAllUsers(params: {
    keyword?: string;
    role?: string;
    is_active?: any;
    sort_field?: string;
    sort_direction?: string;
    per_page?: number;
    page?: number;
  }): Observable<IPaginatedUsers> {
    return this.http
      .get<IPaginatedUsers>(`${this.apiUrl}/admin/users`, {
        params: params as any,
      })
      .pipe(catchError(handleHttpError));
  }

  updateProfilePicture(profilePic: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePic', profilePic);

    return this.http
      .post(`${this.apiUrl}/user/profile-picture`, formData)
      .pipe(catchError(handleHttpError));
  }

  changeRole(role: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/user/profile/role`, { role })
      .pipe(catchError(handleHttpError));
  }

  reviewProduct(reviewData: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/product-review`, reviewData)
      .pipe(catchError(handleHttpError));
  }

  reviewShop(reviewData: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/shop-review`, reviewData)
      .pipe(catchError(handleHttpError));
  }
}
