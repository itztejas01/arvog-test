import { Component, inject } from '@angular/core';
import {
  BulkImportResult,
  BulkUploadService,
} from '../../services/bulk-upload.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.scss',
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
