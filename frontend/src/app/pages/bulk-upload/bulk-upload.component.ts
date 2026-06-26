import { Component, inject } from '@angular/core';
import {
  BulkImportResult,
  BulkUploadService,
} from '../../services/bulk-upload.service';
import {
  UiBadgeComponent,
  UiButtonComponent,
  UiCardComponent,
  UiCardContentComponent,
  uiTableCellClass,
  uiTableClass,
  uiTableHeadClass,
  uiTableHeaderCellClass,
  uiTableRowClass,
} from '../../shared/ui';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [UiButtonComponent, UiCardComponent, UiCardContentComponent, UiBadgeComponent],
  templateUrl: './bulk-upload.component.html',
})
export class BulkUploadComponent {
  private bulkService = inject(BulkUploadService);

  tableClass = uiTableClass;
  tableHeadClass = uiTableHeadClass;
  tableRowClass = uiTableRowClass;
  tableCellClass = uiTableCellClass;
  tableHeaderCellClass = uiTableHeaderCellClass;

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
