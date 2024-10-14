import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';

import { environment } from '../../../../environments/environment';
import { handleHttpError } from '../errors';
import { IUser } from '../../models/auth.state.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  base_url = environment.API_URL;
  private userSubject: BehaviorSubject<IUser | null> =
    new BehaviorSubject<IUser | null>(null);

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorageService
  ) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(this.base_url + '/login', { email, password })
      .pipe(catchError(handleHttpError));
  }

  refreshTokens(access_token: string, refresh_token: string): Observable<any> {
    return this.http
      .post(this.base_url + '/token/refresh', { access_token, refresh_token })
      .pipe(catchError(handleHttpError));
  }

  _logout(): Observable<any> {
    return this.http
      .delete(this.base_url + '/logout')
      .pipe(catchError(handleHttpError));
  }

  getAuthenticatedUser(): Observable<IUser> {
    return this.http
      .get<IUser>(`${this.base_url}/user`)
      .pipe(catchError(handleHttpError));
  }

  logout() {
    this._logout().subscribe({
      next: () => {
        this.localStorage.clear();
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }

  setTokens(tokens: {
    access_token: string;
    refresh_token: string;
    role: string;
  }): void {
    this.localStorage.store('tokens', tokens);
  }

  getTokens(): { access_token: string; refresh_token: string; role: string } {
    const tokens = this.localStorage.retrieve('tokens');
    return {
      access_token: tokens?.access_token || null,
      refresh_token: tokens?.refresh_token || null,
      role: tokens?.role || null,
    };
  }

  setUser(user: IUser): void {
    this.localStorage.store('authUser', user);
    this.userSubject.next(user);
  }

  getUser(): Observable<IUser | null> {
    return this.userSubject.asObservable();
  }
}
