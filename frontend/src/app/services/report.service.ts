import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../core/auth.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  download(format: 'csv' | 'xlsx', categoryId?: string, search?: string) {
    let params = new HttpParams().set('format', format);
    if (categoryId) params = params.set('categoryId', categoryId);
    if (search) params = params.set('search', search);

    return this.http.get('/api/reports/products', {
      params,
      responseType: 'blob',
    });
  }

  triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
