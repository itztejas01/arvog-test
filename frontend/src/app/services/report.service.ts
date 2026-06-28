import { Injectable, inject } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private auth = inject(AuthService);

  download(format: 'csv' | 'xlsx', categoryId?: string, search?: string) {
    const params = new URLSearchParams({ format });
    if (categoryId) params.set('categoryId', categoryId);
    if (search?.trim()) params.set('search', search.trim());

    const token = this.auth.getToken();
    if (token) params.set('token', token);

    window.location.assign(`/api/reports/products?${params.toString()}`);
  }
}
