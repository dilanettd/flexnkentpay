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
  apiUrl = environment.API_URL;
  clientID = environment.CLIENT_ID;
  clientSecret = environment.CLIENT_SECRET;
  private userSubject: BehaviorSubject<IUser | null> =
    new BehaviorSubject<IUser | null>(null);

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorageService
  ) {
    this.localStorage.observe('me').subscribe((me) => {
      this.userSubject.next(me);
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(this.apiUrl + '/login', { email, password })
      .pipe(catchError(handleHttpError));
  }

  resetPassword(
    email: string,
    password: string,
    token: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/password/reset`, {
      email,
      password,
      token,
    });
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password });
  }

  sendResetPasswordEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password/email`, { email });
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post(`${this.apiUrl}/oauth/token`, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientID,
      client_secret: this.clientSecret,
    });
  }
  _logout(): Observable<any> {
    return this.http
      .delete(this.apiUrl + '/logout')
      .pipe(catchError(handleHttpError));
  }

  getAuthenticatedUser(): Observable<IUser> {
    return this.http
      .get<IUser>(`${this.apiUrl}/user`)
      .pipe(catchError(handleHttpError));
  }

  verifyAccountEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/email/verify`, { token });
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

  setTokens(tokens: any): void {
    this.localStorage.store('tokens', {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
  }

  getTokens(): { access_token: string; refresh_token: string; role: string } {
    const tokens = this.localStorage.retrieve('tokens');
    return {
      access_token: tokens?.access_token || null,
      refresh_token: tokens?.refresh_token || null,
      role: tokens?.role || null,
    };
  }

  isAuthenticate(): boolean {
    const tokens = this.localStorage.retrieve('tokens');
    return !!tokens?.access_token;
  }

  setUser(user: IUser): void {
    this.localStorage.store('me', user);
    this.userSubject.next(user);
  }

  getUser(): Observable<IUser | null> {
    const me = this.localStorage.retrieve('me');
    this.userSubject.next(me);
    return this.userSubject.asObservable();
  }
}
