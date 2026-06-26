import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Category, CategoryService } from '../../services/category.service';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="card">
      <h2>Product Reports</h2>
      <p>Download product data as CSV or XLSX. Large exports are streamed to avoid timeouts.</p>

      <form [formGroup]="form" (ngSubmit)="download()" class="report-form">
        <label>
          Format
          <select formControlName="format">
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
          </select>
        </label>
        <label>
          Category (optional)
          <select formControlName="categoryId">
            <option value="">All categories</option>
            @for (cat of categories; track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </label>
        <label>
          Search (optional)
          <input type="search" formControlName="search" placeholder="Product or category name" />
        </label>
        <button type="submit" [disabled]="downloading">
          {{ downloading ? 'Generating...' : 'Download Report' }}
        </button>
      </form>

      @if (error) {
        <p class="error">{{ error }}</p>
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
        max-width: 480px;
      }
      .report-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.875rem;
      }
      input,
      select {
        padding: 0.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
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
      }
      .error {
        color: #dc2626;
      }
    `,
  ],
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories: Category[] = [];
  downloading = false;
  error = '';

  form = this.fb.group({
    format: ['csv' as 'csv' | 'xlsx'],
    categoryId: [''],
    search: [''],
  });

  ngOnInit() {
    this.categoryService.list().subscribe({
      next: (data) => (this.categories = data),
    });
  }

  download() {
    this.downloading = true;
    this.error = '';
    const { format, categoryId, search } = this.form.getRawValue();

    this.reportService
      .download(format!, categoryId || undefined, search || undefined)
      .subscribe({
        next: (blob) => {
          const ext = format === 'xlsx' ? 'xlsx' : 'csv';
          this.reportService.triggerDownload(blob, `products-report.${ext}`);
          this.downloading = false;
        },
        error: () => {
          this.error = 'Failed to download report';
          this.downloading = false;
        },
      });
  }
}
