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
  private readonly userKey = 'auth_user';

  readonly currentUser = signal<AuthUser | null>(null);
  readonly sessionReady = signal(false);

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  register(email: string, password: string) {
    return this.http.post<AuthUser>('/api/auth/register', { email, password });
  }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>('/api/auth/login', { email, password })
      .pipe(
        tap((res) => {
          this.persistSession(res.token, res.user);
        }),
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
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
          const user = { id: res.user.userId, email: res.user.email };
          this.currentUser.set(user);
          localStorage.setItem(this.userKey, JSON.stringify(user));
        }),
      );
  }

  private restoreSession() {
    const token = this.getToken();
    const cachedUser = this.readCachedUser();

    if (cachedUser) {
      this.currentUser.set(cachedUser);
    }

    if (!token) {
      this.sessionReady.set(true);
      return;
    }

    this.loadProfile().subscribe({
      next: () => this.sessionReady.set(true),
      error: (err) => {
        if (err.status === 401) {
          this.logout();
        }
        this.sessionReady.set(true);
      },
    });
  }

  private persistSession(token: string, user: AuthUser) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUser.set(user);
    this.sessionReady.set(true);
  }

  private readCachedUser(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
