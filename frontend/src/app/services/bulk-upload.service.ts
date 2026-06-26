import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface BulkImportResult {
  imported: number;
  failed: number;
  errors: { row: number; message: string }[];
}

@Injectable({ providedIn: 'root' })
export class BulkUploadService {
  private http = inject(HttpClient);

  upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<BulkImportResult>('/api/products/bulk-upload', formData);
  }
}
