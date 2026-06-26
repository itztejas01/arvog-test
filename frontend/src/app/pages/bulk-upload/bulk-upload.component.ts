import { Component, inject } from '@angular/core';
import {
  BulkImportResult,
  BulkUploadService,
} from '../../services/bulk-upload.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  template: `
    <section class="card">
      <h2>Bulk Product Upload</h2>
      <p>Upload a CSV or XLSX file with columns: <code>name</code>, <code>price</code>, <code>categoryName</code>.</p>

      <div class="upload-row">
        <input type="file" accept=".csv,.xlsx" (change)="onFileChange($event)" />
        <button type="button" [disabled]="!selectedFile || uploading" (click)="upload()">
          {{ uploading ? 'Uploading...' : 'Upload' }}
        </button>
      </div>

      @if (error) {
        <p class="error">{{ error }}</p>
      }

      @if (result) {
        <div class="summary">
          <p><strong>Imported:</strong> {{ result.imported }}</p>
          <p><strong>Failed:</strong> {{ result.failed }}</p>
        </div>

        @if (result.errors.length > 0) {
          <table>
            <thead>
              <tr>
                <th>Row</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              @for (err of result.errors; track err.row + err.message) {
                <tr>
                  <td>{{ err.row }}</td>
                  <td>{{ err.message }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    </section>
  `,
  styles: [
    `
      .card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
      }
      .upload-row {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin: 1rem 0;
      }
      button {
        padding: 0.5rem 1rem;
        background: #2563eb;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .error {
        color: #dc2626;
      }
      .summary {
        margin: 1rem 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 0.5rem;
        border-bottom: 1px solid #e2e8f0;
      }
    `,
  ],
})
export class BulkUploadComponent {
  private bulkService = inject(BulkUploadService);

  selectedFile: File | null = null;
  uploading = false;
  error = '';
  result: BulkImportResult | null = null;

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.result = null;
    this.error = '';
  }

  upload() {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.error = '';
    this.result = null;

    this.bulkService.upload(this.selectedFile).subscribe({
      next: (res) => {
        this.result = res;
        this.uploading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Upload failed';
        this.uploading = false;
      },
    });
  }
}
