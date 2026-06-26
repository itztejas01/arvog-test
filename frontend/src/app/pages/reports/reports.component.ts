import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Category, CategoryService } from '../../services/category.service';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
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
