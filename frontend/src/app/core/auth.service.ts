import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  readonly currentUser = signal<AuthUser | null>(null);

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.loadProfile().subscribe({ error: () => this.logout() });
    }
  }

  register(email: string, password: string) {
    return this.http.post<AuthUser>('/api/auth/register', { email, password });
  }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>('/api/auth/login', { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.token);
          this.currentUser.set(res.user);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  loadProfile() {
    return this.http
      .get<{ user: { userId: string; email: string } }>('/api/users/me')
      .pipe(
        tap((res) => {
          this.currentUser.set({ id: res.user.userId, email: res.user.email });
        })
      );
  }
}
