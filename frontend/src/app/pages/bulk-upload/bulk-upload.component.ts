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
  UiFileInputComponent,
  uiTableCellClass,
  uiTableClass,
  uiTableHeadClass,
  uiTableHeaderCellClass,
  uiTableRowClass,
} from '../../shared/ui';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [
    UiButtonComponent,
    UiCardComponent,
    UiCardContentComponent,
    UiBadgeComponent,
    UiFileInputComponent,
  ],
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

  private readonly sampleCsv = [
    'name,price,categoryName',
    'Wireless Mouse,29.99,Electronics',
    'USB Keyboard,49.99,Electronics',
    'T-Shirt,19.99,Clothing',
    'Jeans,59.99,Clothing',
    'TypeScript Handbook,39.99,Books',
  ].join('\n');

  onFileChange(file: File | null) {
    this.selectedFile = file;
    this.result = null;
    this.error = '';
  }

  downloadSample() {
    const blob = new Blob([this.sampleCsv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'products-import-sample.csv';
    anchor.click();
    URL.revokeObjectURL(url);
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
